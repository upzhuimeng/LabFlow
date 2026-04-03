# -*- coding: utf-8 -*-
# File: agent.py
# Description: 智能助手 API 路由

import json
import re
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.agent.schemas.deps import ReservationAssistantDeps
from app.core.agents import get_reservation_agent
from app.models.user import User
from app.schemas.base import BaseResponse


router = APIRouter(prefix="/api/v1/agent", tags=["智能助手"])


class ReservationAssistantRequest(BaseModel):
    message: str = Field(..., description="用户的需求描述")


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
    agent = get_reservation_agent()

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
                    "raw_response": text_output,
                    "debug_parsed": parsed,
                }
            )
        else:
            return BaseResponse(
                data={
                    "success": False,
                    "suggestion": None,
                    "message": text_output if text_output else "未找到合适的实验室",
                    "available_slots": [],
                    "debug_parsed": parsed,
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
