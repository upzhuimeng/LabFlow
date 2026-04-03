# -*- coding: utf-8 -*-
# File: reservation.py
# Description: 预约相关工具函数

from datetime import datetime
from pydantic_ai import RunContext
from typing import Any

from app.agent.schemas.deps import ReservationAssistantDeps
from app.agent.schemas.reservation_assistant import AvailabilityResult


async def check_availability(
    ctx: RunContext[ReservationAssistantDeps],
    lab_id: int,
    date: str,
    start_hour: int,
    end_hour: int,
) -> AvailabilityResult:
    """检查实验室在指定时间段是否可用

    Args:
        lab_id: 实验室ID
        date: 日期，格式 YYYY-MM-DD
        start_hour: 开始小时（0-23）
        end_hour: 结束小时（0-23）
    """
    from app.crud import reservation as reservation_crud

    start_time = datetime.strptime(f"{date} {start_hour}:00", "%Y-%m-%d %H:%M")
    end_time = datetime.strptime(f"{date} {end_hour}:00", "%Y-%m-%d %H:%M")

    conflicts = await reservation_crud.check_time_conflict(
        ctx.deps.db,
        lab_id=lab_id,
        start_time=start_time,
        end_time=end_time,
    )

    if conflicts:
        return AvailabilityResult(
            available=False,
            reason="该时间段已被预约",
            conflicts=[
                {"start": c.start_time.isoformat(), "end": c.end_time.isoformat()}
                for c in conflicts
            ],
        )

    return AvailabilityResult(
        available=True,
        reason="",
    )


async def get_user_reservations(
    ctx: RunContext[ReservationAssistantDeps],
) -> list[dict[str, Any]]:
    """获取当前用户的预约列表

    Returns:
        用户的所有预约（不管状态）
    """
    from app.crud import reservation as reservation_crud
    from app.crud import lab as lab_crud

    reservations, _ = await reservation_crud.get_reservations_by_user(
        ctx.deps.db,
        user_id=ctx.deps.user_id,
        status=None,
    )

    result = []
    for r in reservations:
        lab = await lab_crud.get_lab_by_id(ctx.deps.db, r.lab_id)
        result.append(
            {
                "id": r.id,
                "lab_name": lab.name if lab else "未知",
                "start_time": r.start_time.isoformat(),
                "end_time": r.end_time.isoformat(),
                "status": r.status,
                "status_text": _get_status_text(r.status),
            }
        )

    return result


def _get_status_text(status: int) -> str:
    """获取状态文本"""
    status_map = {
        0: "审批中",
        1: "已通过",
        2: "已拒绝",
        3: "已取消",
        4: "草稿",
    }
    return status_map.get(status, "未知")
