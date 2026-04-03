# -*- coding: utf-8 -*-
# File: statistics.py
# Description: 统计报表路由

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.base import BaseResponse
from app.services import statistics as statistics_service


router = APIRouter(prefix="/api/v1/statistics", tags=["统计报表"])


@router.get("/report", response_model=BaseResponse)
async def get_report(
    type: str = Query("daily", description="报表类型: daily, weekly 或 monthly"),
    start_date: str | None = Query(None, description="开始日期 YYYY-MM-DD"),
    end_date: str | None = Query(None, description="结束日期 YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取统计报表（仅管理员）"""
    if current_user.role not in [0, 1]:
        return BaseResponse(code=403, message="权限不足，仅管理员可查看")

    now = datetime.now(timezone.utc).replace(tzinfo=None)

    if type == "daily":
        _start: datetime
        _end: datetime
        if not start_date:
            _start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        else:
            _start = datetime.strptime(start_date, "%Y-%m-%d")

        if not end_date:
            _end = now
        else:
            _end = datetime.strptime(end_date, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59
            )

        report = await statistics_service.generate_daily_report(db, _start, _end)

    elif type == "weekly":
        _start: datetime
        _end: datetime
        if not start_date:
            _start = (now - timedelta(days=now.weekday())).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
        else:
            _start = datetime.strptime(start_date, "%Y-%m-%d")

        if not end_date:
            _end = now
        else:
            _end = datetime.strptime(end_date, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59
            )

        report = await statistics_service.generate_weekly_report(db, _start, _end)

    elif type == "monthly":
        _start: datetime
        _end: datetime
        if not start_date:
            _start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            _start = datetime.strptime(start_date, "%Y-%m-%d")

        if not end_date:
            _end = now
        else:
            _end = datetime.strptime(end_date, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59
            )

        report = await statistics_service.generate_monthly_report(db, _start, _end)

    else:
        return BaseResponse(code=400, message="无效的报表类型")

    return BaseResponse(data=report)


@router.get("/summary", response_model=BaseResponse)
async def get_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取总体统计摘要（仅管理员）"""
    if current_user.role not in [0, 1]:
        return BaseResponse(code=403, message="权限不足，仅管理员可查看")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    stats = await statistics_service.get_reservation_stats(db, month_start, now)
    lab_stats = await statistics_service.get_lab_usage_stats(
        db, month_start, now, limit=5
    )

    return BaseResponse(
        data={
            "month_stats": stats,
            "top_labs": lab_stats,
        }
    )
