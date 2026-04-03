# -*- coding: utf-8 -*-
# File: agent.py
# Description: 智能助手 API 路由

import json
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.agent.schemas.deps import ReservationAssistantDeps
from app.core.agents import get_reservation_agent, get_statistics_agent
from app.models.user import User
from app.schemas.base import BaseResponse
from app.crud import agent_log as agent_log_crud
from app.crud import notification as notification_crud
from app.utils.context_storage import save_context, load_context


router = APIRouter(prefix="/api/v1/agent", tags=["智能助手"])

RATE_LIMIT_MINUTES = 10
RATE_LIMIT_MAX_REQUESTS = 3

NOTIF_TYPE_AGENT_RESULT = 4


class ReservationAssistantRequest(BaseModel):
    message: str = Field(..., description="用户的需求描述")


class CompleteConversationRequest(BaseModel):
    log_id: int = Field(..., description="日志ID")


class StatisticsAssistantRequest(BaseModel):
    report_data: dict = Field(..., description="报表数据")
    report_type: str = Field(..., description="报表类型: weekly 或 monthly")


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

        agent_output = result.output
        text_output = (
            agent_output.model_dump_json()
            if hasattr(agent_output, "model_dump_json")
            else str(agent_output)
        )

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

        if (
            agent_output.lab_id
            and agent_output.lab_name
            and agent_output.start_time
            and agent_output.end_time
        ):
            suggestion = {
                "lab_id": agent_output.lab_id,
                "lab_name": agent_output.lab_name or "",
                "address": agent_output.address or "",
                "start_time": agent_output.start_time or "",
                "end_time": agent_output.end_time or "",
                "reason": agent_output.reason or "",
                "purpose": agent_output.purpose or "",
            }
            suggestion_json = json.dumps(suggestion, ensure_ascii=False)
            await notification_crud.create_notification(
                db,
                user_id=current_user.id,
                title="智能推荐结果",
                content=f"已为您找到合适的实验室：{agent_output.lab_name}",
                notif_type=NOTIF_TYPE_AGENT_RESULT,
                related_id=agent_output.lab_id,
                attachment=suggestion_json,
            )
            return BaseResponse(
                data={
                    "success": True,
                    "message": "推荐结果已发送到您的消息通知，请查收",
                    "log_id": log_id,
                }
            )
        else:
            await notification_crud.create_notification(
                db,
                user_id=current_user.id,
                title="智能推荐结果",
                content=agent_output.reason or "未找到合适的实验室",
                notif_type=NOTIF_TYPE_AGENT_RESULT,
            )
            return BaseResponse(
                data={
                    "success": False,
                    "message": "推荐结果已发送到您的消息通知，请查收",
                    "log_id": log_id,
                }
            )
    except Exception as e:
        return BaseResponse(
            data={
                "success": False,
                "message": f"处理失败: {str(e)}",
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


async def generate_and_notify_task(
    user_id: int,
    user_name: str,
    report_data: dict,
    report_type: str,
):
    """后台任务：生成 AI 总结并发送通知"""
    from app.db.session import Session_Local

    async with Session_Local() as db:
        try:
            agent = get_statistics_agent()

            deps = ReservationAssistantDeps(
                user_id=user_id,
                user_name=user_name,
                db=db,
            )

            report_json = json.dumps(report_data, ensure_ascii=False)
            prompt = f"请分析以下{report_type}数据并生成总结：\n\n{report_json}"

            result = await agent.run(prompt, deps=deps)
            summary = result.output

            report_type_text = "周报" if report_type == "weekly" else "月报"
            period_info = f"{report_data.get('start_date', '')} 至 {report_data.get('end_date', '')}"

            attachment_data = {
                "summary": summary,
                "report_type": report_type,
                "period": period_info,
                "stats": report_data.get("current_period", {}),
                "lab_stats": report_data.get("lab_stats", []),
                "user_stats": report_data.get("user_stats", []),
                "changes": report_data.get("changes", {}),
            }

            await notification_crud.create_notification(
                db,
                user_id=user_id,
                title=f"AI 数据总结（{report_type_text}）",
                content=f"{period_info} {report_type_text}数据 AI 总结已完成，点击查看详情",
                notif_type=5,
                attachment=json.dumps(attachment_data, ensure_ascii=False),
            )
        except Exception:
            pass


@router.post("/statistics/summarize", response_model=BaseResponse)
async def summarize_statistics(
    request: StatisticsAssistantRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    """
    AI 统计总结助手

    后台异步生成总结，完成后发送通知到用户消息信箱
    """
    if current_user.role not in [0, 1]:
        return BaseResponse(code=403, message="权限不足，仅管理员可使用")

    background_tasks.add_task(
        generate_and_notify_task,
        current_user.id,
        current_user.name,
        request.report_data,
        request.report_type,
    )

    return BaseResponse(
        message=f"正在生成{request.report_type == 'weekly' and '周报' or '月报'}总结，完成后将发送到您的信箱",
    )
