# -*- coding: utf-8 -*-
# File: agent.py
# Description: 智能助手 API 路由

import json
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.agent.schemas.deps import ReservationAssistantDeps
from app.core.agents.reservation_agent import get_reservation_agent
from app.core.agents.statistics_agent import get_statistics_agent
from app.core.agents.intent_parser import get_intent_parser
from app.models.user import User
from app.schemas.base import BaseResponse
from app.crud import agent_log as agent_log_crud
from app.crud import notification as notification_crud
from app.utils.context_storage import save_context, load_context

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s"
)
logger = logging.getLogger(__name__)


router = APIRouter(prefix="/api/v1/agent", tags=["智能助手"])

RATE_LIMIT_MINUTES = 10
RATE_LIMIT_MAX_REQUESTS = 3

NOTIF_TYPE_AGENT_RESULT = 4
MAX_VALIDATION_ERRORS = 3


def _parse_intent_json(text: str) -> dict:
    """解析意图解析器的 JSON 输出"""
    import re
    import json

    json_match = re.search(r"\{[^{}]*\}", text)
    if not json_match:
        return {}

    try:
        data = json.loads(json_match.group())
        return {
            "keyword": data.get("keyword"),
            "equipment": data.get("equipment"),
            "date": data.get("date"),
            "start_hour": data.get("start_hour"),
            "end_hour": data.get("end_hour"),
            "purpose": data.get("purpose"),
        }
    except json.JSONDecodeError:
        return {}


def validate_and_parse_agent_output(
    text_output: str,
) -> tuple[bool, dict, str]:
    """验证并解析 Agent 文本输出

    Returns:
        (is_valid, parsed_data, error_message)
    """
    import re
    import json
    from datetime import datetime

    try:
        json_match = re.search(r'\{[^{}]*"lab_id"[^{}]*\}', text_output)
        if not json_match:
            return False, {}, "输出格式错误：未找到有效 JSON"

        data = json.loads(json_match.group())

        lab_id = data.get("lab_id")
        lab_name = data.get("lab_name")
        _address = data.get("address")
        start_time = data.get("start_time")
        end_time = data.get("end_time")
        _reason = data.get("reason", "")
        _purpose = data.get("purpose")

        if lab_id is not None:
            if not start_time or not end_time:
                return False, {}, "输出错误：指定了实验室但缺少时间范围"
            try:
                start = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S")
                end = datetime.strptime(end_time, "%Y-%m-%dT%H:%M:%S")
                if end <= start:
                    return False, {}, "输出错误：结束时间早于或等于开始时间"
                if start < datetime.now():
                    return False, {}, "输出错误：开始时间为过去时间"
            except ValueError as e:
                return False, {}, f"输出错误：时间格式错误 - {e}"

        if lab_id is None and lab_name:
            return False, {}, "输出错误：返回了实验室名称但未提供实验室ID"

        return True, data, ""

    except json.JSONDecodeError as e:
        return False, {}, f"JSON 解析错误: {e}"
    except Exception as e:
        return False, {}, f"解析错误: {e}"


async def build_suggestion_from_db(db: AsyncSession, user_message: str) -> dict | None:
    """当模型未返回结构化数据时，直接查询一个正常状态的实验室供用户参考"""
    from app.crud import lab as lab_crud

    labs, _ = await lab_crud.get_labs(db, status=0, keyword=None, limit=1)
    if not labs:
        return None

    lab = labs[0]
    now = datetime.now()
    today = now.date().isoformat()

    return {
        "lab_id": lab.id,
        "lab_name": lab.name,
        "address": lab.address,
        "start_time": f"{today}T09:00:00",
        "end_time": f"{today}T12:00:00",
        "reason": f"根据您的需求推荐 {lab.name}，建议您查看具体可用时间",
        "purpose": "",
    }


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
        if context_data is None:
            context_data = {"messages": [], "validation_errors": 0}
    else:
        context_data = {"messages": [], "validation_errors": 0}

    context_data.setdefault("messages", []).append(
        {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat(),
        }
    )

    validation_errors = context_data.get("validation_errors", 0)

    deps = ReservationAssistantDeps(
        user_id=current_user.id,
        user_name=current_user.name,
        db=db,
    )

    try:
        logger.info(f"[Agent] 用户消息: {request.message}")

        intent_parser = get_intent_parser()
        intent_result = await intent_parser.run(request.message, deps=deps)

        logger.info(f"[Agent] intent_result raw: {intent_result.output}")

        intent_text = str(intent_result.output)
        intent_data = _parse_intent_json(intent_text)

        logger.info(f"[Agent] 意图解析结果: {intent_data}")

        parsed_message = request.message
        intent_parts = []
        if intent_data.get("keyword"):
            intent_parts.append(f"实验室类型：{intent_data['keyword']}")
        if intent_data.get("equipment"):
            intent_parts.append(f"所需设备：{intent_data['equipment']}")
        if intent_data.get("date"):
            intent_parts.append(f"预约日期：{intent_data['date']}")
        if (
            intent_data.get("start_hour") is not None
            and intent_data.get("end_hour") is not None
        ):
            intent_parts.append(
                f"预约时间：{intent_data['start_hour']}:00-{intent_data['end_hour']}:00"
            )
        if intent_data.get("purpose"):
            intent_parts.append(f"预约用途：{intent_data['purpose']}")

        if intent_parts:
            parsed_message = (
                f"{request.message}\n\n【用户意图解析】{'；'.join(intent_parts)}"
            )
            logger.info(f"[Agent] 解析后的消息: {parsed_message}")

        result = await agent.run(parsed_message, deps=deps)

        text_output = str(result.output)

        logger.info(f"[Agent] Agent输出: {text_output}")

        tool_calls = result.tool_calls if hasattr(result, "tool_calls") else None
        if tool_calls:
            logger.info(f"[Agent] 工具调用: {[tc.tool_name for tc in tool_calls]}")
        else:
            logger.info("[Agent] 工具调用: None")

        is_valid, parsed_data, error_msg = validate_and_parse_agent_output(text_output)
        logger.info(f"[Agent] 验证结果: is_valid={is_valid}, error={error_msg}")

        if not is_valid:
            validation_errors += 1
            context_data["validation_errors"] = validation_errors

            if validation_errors >= MAX_VALIDATION_ERRORS:
                context_data["messages"].append(
                    {
                        "role": "assistant",
                        "content": f"系统错误：模型连续返回无效格式达 {validation_errors} 次，请稍后再试或联系管理员",
                        "timestamp": datetime.now().isoformat(),
                    }
                )
                context_file = save_context(current_user.id, context_data)
                if active_log:
                    await agent_log_crud.update_context_file(
                        db, active_log.id, current_user.id, context_file
                    )
                await notification_crud.create_notification(
                    db,
                    user_id=current_user.id,
                    title="智能推荐结果",
                    content="智能助手处理失败，连续返回无效格式，请稍后再试",
                    notif_type=NOTIF_TYPE_AGENT_RESULT,
                )
                return BaseResponse(
                    data={
                        "success": False,
                        "message": "处理失败：模型输出格式连续无效，请稍后再试",
                    }
                )

            context_data["messages"].append(
                {
                    "role": "assistant",
                    "content": f"格式验证失败 ({validation_errors}/{MAX_VALIDATION_ERRORS}): {error_msg}",
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

            await notification_crud.create_notification(
                db,
                user_id=current_user.id,
                title="智能推荐结果",
                content=f"处理失败：{error_msg}",
                notif_type=NOTIF_TYPE_AGENT_RESULT,
            )
            return BaseResponse(
                data={
                    "success": False,
                    "message": f"处理失败：{error_msg}",
                    "log_id": log_id,
                }
            )

        validation_errors = 0
        context_data["validation_errors"] = 0

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

        lab_id = parsed_data.get("lab_id")
        lab_name = parsed_data.get("lab_name")
        address = parsed_data.get("address") or ""
        start_time = parsed_data.get("start_time") or ""
        end_time = parsed_data.get("end_time") or ""
        reason = parsed_data.get("reason", "") or ""
        purpose = parsed_data.get("purpose") or ""

        if lab_id and lab_name and start_time and end_time:
            suggestion = {
                "lab_id": lab_id,
                "lab_name": lab_name or "",
                "address": address or "",
                "start_time": start_time or "",
                "end_time": end_time or "",
                "reason": reason or "",
                "purpose": purpose or "",
            }
            suggestion_json = json.dumps(suggestion, ensure_ascii=False)
            await notification_crud.create_notification(
                db,
                user_id=current_user.id,
                title="智能推荐结果",
                content=f"已为您找到合适的实验室：{lab_name}",
                notif_type=NOTIF_TYPE_AGENT_RESULT,
                related_id=lab_id,
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
                content=reason or "未找到合适的实验室",
                notif_type=NOTIF_TYPE_AGENT_RESULT,
            )
            return BaseResponse(
                data={
                    "success": False,
                    "message": reason or "未找到合适的实验室",
                    "log_id": log_id,
                }
            )
    except Exception as e:
        await notification_crud.create_notification(
            db,
            user_id=current_user.id,
            title="智能推荐结果",
            content=f"处理失败: {str(e)}",
            notif_type=NOTIF_TYPE_AGENT_RESULT,
        )
        return BaseResponse(
            data={
                "success": False,
                "message": f"处理失败: {str(e)}，结果已发送到您的消息通知",
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
