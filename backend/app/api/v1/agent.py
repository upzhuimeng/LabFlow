# -*- coding: utf-8 -*-
# File: agent.py
# Description: 智能助手 API 路由

import json
import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.agent.schemas.deps import ReservationAssistantDeps
from app.core.agents import get_reservation_agent
from app.models.user import User
from app.schemas.base import BaseResponse
from app.crud import agent_log as agent_log_crud
from app.utils.context_storage import save_context, load_context


router = APIRouter(prefix="/api/v1/agent", tags=["智能助手"])

RATE_LIMIT_MINUTES = 10
RATE_LIMIT_MAX_REQUESTS = 3


class ReservationAssistantRequest(BaseModel):
    message: str = Field(..., description="用户的需求描述")
    notification_id: int | None = Field(
        None, description="关联的通知ID（可选，用于标记卡片过期）"
    )


class CompleteConversationRequest(BaseModel):
    log_id: int = Field(..., description="日志ID")


def parse_agent_response(text: str) -> dict:
    """解析 Agent 返回的文本，提取 JSON 结果"""
    json_patterns = [
        r"```json\s*(\{[^}]+\})\s*```",
        r"```\s*(\{[^}]+\})\s*```",
        r"(\{[^{}]*\})",
    ]
    for pattern in json_patterns:
        json_match = re.search(pattern, text, re.DOTALL)
        if json_match:
            try:
                data = json.loads(json_match.group(1))
                return data
            except json.JSONDecodeError:
                pass
    return {"lab_id": None}


@router.post("/reservation/assist", response_model=BaseResponse)
async def assist_reservation(
    request: ReservationAssistantRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    智能预约助手

    用户描述需求，返回推荐的实验室和时间段
    """
    count, _ = await agent_log_crud.get_recent_incomplete_count(
        db, current_user.id, RATE_LIMIT_MINUTES, RATE_LIMIT_MAX_REQUESTS
    )
    if count >= RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail=f"请求过于频繁，请在 {RATE_LIMIT_MINUTES} 分钟后再试",
        )

    agent = get_reservation_agent()

    active_log = await agent_log_crud.get_active_log(db, current_user.id)
    if active_log:
        context_data = load_context(active_log.context_file)
    else:
        context_data = {"messages": []}

    context_data.setdefault("messages", []).append(
        {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat(),
        }
    )

    deps = ReservationAssistantDeps(
        user_id=current_user.id,
        user_name=current_user.name,
        db=db,
    )

    try:
        result = await agent.run(
            request.message,
            deps=deps,
        )

        text_output = result.output
        parsed = parse_agent_response(text_output)

        context_data["messages"].append(
            {
                "role": "assistant",
                "content": text_output,
                "timestamp": datetime.now().isoformat(),
            }
        )

        context_file = save_context(current_user.id, context_data)

        if active_log:
            await agent_log_crud.update_context_file(
                db, active_log.id, current_user.id, context_file
            )
            log_id = active_log.id
        else:
            log = await agent_log_crud.create_agent_log(
                db,
                user_id=current_user.id,
                input_message=request.message[:200],
                context_file=context_file,
            )
            log_id = log.id

        if parsed.get("lab_id"):
            suggestion = {
                "lab_id": parsed["lab_id"],
                "lab_name": parsed.get("lab_name", ""),
                "address": parsed.get("address", ""),
                "start_time": parsed.get("start_time", ""),
                "end_time": parsed.get("end_time", ""),
                "reason": parsed.get("reason", ""),
                "equipment": parsed.get("equipment", []),
            }
            return BaseResponse(
                data={
                    "success": True,
                    "suggestion": suggestion,
                    "message": "已为您找到合适的实验室，请确认后提交预约",
                    "available_slots": [],
                    "log_id": log_id,
                }
            )
        else:
            return BaseResponse(
                data={
                    "success": False,
                    "suggestion": None,
                    "message": text_output if text_output else "未找到合适的实验室",
                    "available_slots": [],
                    "log_id": log_id,
                }
            )
    except Exception as e:
        return BaseResponse(
            data={
                "success": False,
                "suggestion": None,
                "message": f"处理失败: {str(e)}",
                "available_slots": [],
            }
        )


@router.post("/complete", response_model=BaseResponse)
async def complete_conversation(
    request: CompleteConversationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """标记对话为已完成"""
    success = await agent_log_crud.mark_as_completed(
        db, request.log_id, current_user.id
    )
    if not success:
        return BaseResponse(code=404, message="对话不存在")
    return BaseResponse(message="对话已标记为完成")


@router.post("/abandon", response_model=BaseResponse)
async def abandon_conversation(
    request: CompleteConversationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """标记对话为已放弃"""
    success = await agent_log_crud.mark_as_abandoned(
        db, request.log_id, current_user.id
    )
    if not success:
        return BaseResponse(code=404, message="对话不存在")
    return BaseResponse(message="对话已标记为放弃")
