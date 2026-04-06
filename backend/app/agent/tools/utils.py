# -*- coding: utf-8 -*-
# File: utils.py
# Description: 通用工具函数

from datetime import datetime, timedelta
from pydantic_ai import RunContext

from app.agent.schemas.deps import ReservationAssistantDeps


async def get_date_info(
    ctx: RunContext[ReservationAssistantDeps],
) -> dict:
    """获取当前日期信息

    Returns:
        包含当前日期和常用日期的字典
    """
    now = datetime.now()
    today = now.date()
    return {
        "today": today.isoformat(),
        "tomorrow": (today + timedelta(days=1)).isoformat(),
        "day_after_tomorrow": (today + timedelta(days=2)).isoformat(),
        "current_year": now.year,
        "current_month": now.month,
        "current_day": now.day,
        "current_hour": now.hour,
        "current_minute": now.minute,
    }
