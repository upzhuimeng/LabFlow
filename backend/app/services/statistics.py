# -*- coding: utf-8 -*-
# File: statistics.py
# Description: 统计报表业务逻辑

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Dict, Any, List
from datetime import datetime, timedelta

from app.models.reservation import Reservation
from app.models.lab import Lab
from app.models.user import User


async def get_reservation_stats(
    db: AsyncSession,
    start_date: datetime,
    end_date: datetime,
) -> Dict[str, Any]:
    """获取预约统计数据"""
    query = select(
        func.count(Reservation.id).label("total"),
        func.sum(func.if_(Reservation.status == 1, 1, 0)).label("approved"),
        func.sum(func.if_(Reservation.status == 2, 1, 0)).label("rejected"),
        func.sum(func.if_(Reservation.status == 3, 1, 0)).label("cancelled"),
    ).where(
        and_(
            Reservation.start_time >= start_date,
            Reservation.start_time <= end_date,
            Reservation.is_deleted == 0,
        )
    )

    result = await db.execute(query)
    row = result.first()

    if not row:
        return {
            "total": 0,
            "approved": 0,
            "rejected": 0,
            "cancelled": 0,
            "pending": 0,
        }

    return {
        "total": row.total or 0,
        "approved": row.approved or 0,
        "rejected": row.rejected or 0,
        "cancelled": row.cancelled or 0,
        "pending": (row.total or 0)
        - (row.approved or 0)
        - (row.rejected or 0)
        - (row.cancelled or 0),
    }


async def get_daily_stats(
    db: AsyncSession,
    start_date: datetime,
    end_date: datetime,
) -> List[Dict[str, Any]]:
    """获取每日统计数据"""
    query = (
        select(
            func.date(Reservation.start_time).label("date"),
            func.count(Reservation.id).label("total"),
            func.sum(func.if_(Reservation.status == 1, 1, 0)).label("approved"),
            func.sum(func.if_(Reservation.status == 2, 1, 0)).label("rejected"),
        )
        .where(
            and_(
                Reservation.start_time >= start_date,
                Reservation.start_time <= end_date,
                Reservation.is_deleted == 0,
            )
        )
        .group_by(func.date(Reservation.start_time))
        .order_by(func.date(Reservation.start_time))
    )

    result = await db.execute(query)
    rows = result.fetchall()

    return [
        {
            "date": str(row.date),
            "total": row.total,
            "approved": row.approved,
            "rejected": row.rejected,
        }
        for row in rows
    ]


async def get_lab_usage_stats(
    db: AsyncSession,
    start_date: datetime,
    end_date: datetime,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """获取实验室使用统计"""
    query = (
        select(
            Reservation.lab_id,
            Lab.name.label("lab_name"),
            func.count(Reservation.id).label("reservation_count"),
            func.sum(func.if_(Reservation.status == 1, 1, 0)).label("approved_count"),
        )
        .join(Lab, Lab.id == Reservation.lab_id)
        .where(
            and_(
                Reservation.start_time >= start_date,
                Reservation.start_time <= end_date,
                Reservation.is_deleted == 0,
                Lab.status != 3,
            )
        )
        .group_by(Reservation.lab_id, Lab.name)
        .order_by(func.count(Reservation.id).desc())
        .limit(limit)
    )

    result = await db.execute(query)
    rows = result.fetchall()

    return [
        {
            "lab_id": row.lab_id,
            "lab_name": row.lab_name,
            "reservation_count": row.reservation_count,
            "approved_count": row.approved_count,
        }
        for row in rows
    ]


async def get_user_activity_stats(
    db: AsyncSession,
    start_date: datetime,
    end_date: datetime,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """获取用户活跃度统计"""
    query = (
        select(
            Reservation.user_id,
            User.name.label("user_name"),
            User.phone.label("user_phone"),
            func.count(Reservation.id).label("reservation_count"),
            func.sum(func.if_(Reservation.status == 1, 1, 0)).label("approved_count"),
        )
        .join(User, User.id == Reservation.user_id)
        .where(
            and_(
                Reservation.start_time >= start_date,
                Reservation.start_time <= end_date,
                Reservation.is_deleted == 0,
            )
        )
        .group_by(Reservation.user_id, User.name, User.phone)
        .order_by(func.count(Reservation.id).desc())
        .limit(limit)
    )

    result = await db.execute(query)
    rows = result.fetchall()

    return [
        {
            "user_id": row.user_id,
            "user_name": row.user_name,
            "user_phone": row.user_phone,
            "reservation_count": row.reservation_count,
            "approved_count": row.approved_count,
        }
        for row in rows
    ]


async def get_time_slot_stats(
    db: AsyncSession,
    start_date: datetime,
    end_date: datetime,
) -> Dict[str, Any]:
    """获取预约时段分布统计"""
    query = (
        select(
            func.hour(Reservation.start_time).label("hour"),
            func.count(Reservation.id).label("count"),
        )
        .where(
            and_(
                Reservation.start_time >= start_date,
                Reservation.start_time <= end_date,
                Reservation.is_deleted == 0,
            )
        )
        .group_by(func.hour(Reservation.start_time))
        .order_by(func.hour(Reservation.start_time))
    )

    result = await db.execute(query)
    rows = result.fetchall()

    time_slots = {}
    for row in rows:
        if row.hour is not None:
            time_slots[f"{row.hour:02d}:00"] = row.count

    return time_slots


async def generate_weekly_report(
    db: AsyncSession,
    start_date: datetime,
    end_date: datetime,
) -> Dict[str, Any]:
    """生成周报"""
    current_stats = await get_reservation_stats(db, start_date, end_date)
    daily_stats = await get_daily_stats(db, start_date, end_date)
    lab_stats = await get_lab_usage_stats(db, start_date, end_date, limit=10)
    user_stats = await get_user_activity_stats(db, start_date, end_date, limit=10)
    time_slot_stats = await get_time_slot_stats(db, start_date, end_date)

    prev_start = start_date - timedelta(days=7)
    prev_end = end_date - timedelta(days=7)
    prev_stats = await get_reservation_stats(db, prev_start, prev_end)

    def calc_change(current: int, previous: int) -> float:
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round(((current - previous) / previous) * 100, 2)

    return {
        "report_type": "weekly",
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "current_period": current_stats,
        "previous_period": prev_stats,
        "changes": {
            "total_change": calc_change(current_stats["total"], prev_stats["total"]),
            "approved_change": calc_change(
                current_stats["approved"], prev_stats["approved"]
            ),
            "rejected_change": calc_change(
                current_stats["rejected"], prev_stats["rejected"]
            ),
        },
        "daily_stats": daily_stats,
        "lab_stats": lab_stats,
        "user_stats": user_stats,
        "time_slot_stats": time_slot_stats,
    }


async def generate_monthly_report(
    db: AsyncSession,
    start_date: datetime,
    end_date: datetime,
) -> Dict[str, Any]:
    """生成月报"""
    current_stats = await get_reservation_stats(db, start_date, end_date)
    daily_stats = await get_daily_stats(db, start_date, end_date)
    lab_stats = await get_lab_usage_stats(db, start_date, end_date, limit=20)
    user_stats = await get_user_activity_stats(db, start_date, end_date, limit=10)
    time_slot_stats = await get_time_slot_stats(db, start_date, end_date)

    prev_start = start_date - timedelta(days=30)
    prev_end = end_date - timedelta(days=30)
    prev_stats = await get_reservation_stats(db, prev_start, prev_end)

    def calc_change(current: int, previous: int) -> float:
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round(((current - previous) / previous) * 100, 2)

    abnormal_query = (
        select(
            Reservation.user_id,
            User.name.label("user_name"),
            func.count(Reservation.id).label("cancel_count"),
        )
        .join(User, User.id == Reservation.user_id)
        .where(
            and_(
                Reservation.start_time >= start_date,
                Reservation.start_time <= end_date,
                Reservation.is_deleted == 0,
                Reservation.status == 3,
            )
        )
        .group_by(Reservation.user_id, User.name)
        .having(func.count(Reservation.id) >= 3)
        .order_by(func.count(Reservation.id).desc())
    )

    abnormal_result = await db.execute(abnormal_query)
    abnormal_rows = abnormal_result.fetchall()
    abnormal_users = [
        {
            "user_id": row.user_id,
            "user_name": row.user_name,
            "cancel_count": row.cancel_count,
        }
        for row in abnormal_rows
    ]

    return {
        "report_type": "monthly",
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "current_period": current_stats,
        "previous_period": prev_stats,
        "changes": {
            "total_change": calc_change(current_stats["total"], prev_stats["total"]),
            "approved_change": calc_change(
                current_stats["approved"], prev_stats["approved"]
            ),
            "rejected_change": calc_change(
                current_stats["rejected"], prev_stats["rejected"]
            ),
        },
        "daily_stats": daily_stats,
        "lab_stats": lab_stats,
        "user_stats": user_stats,
        "time_slot_stats": time_slot_stats,
        "abnormal_users": abnormal_users,
    }


async def generate_daily_report(
    db: AsyncSession,
    start_date: datetime,
    end_date: datetime,
) -> Dict[str, Any]:
    """生成日报"""
    current_stats = await get_reservation_stats(db, start_date, end_date)
    lab_stats = await get_lab_usage_stats(db, start_date, end_date, limit=10)
    user_stats = await get_user_activity_stats(db, start_date, end_date, limit=10)
    time_slot_stats = await get_time_slot_stats(db, start_date, end_date)

    prev_start = start_date - timedelta(days=1)
    prev_end = end_date - timedelta(days=1)
    prev_stats = await get_reservation_stats(db, prev_start, prev_end)

    def calc_change(current: int, previous: int) -> float:
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round(((current - previous) / previous) * 100, 2)

    return {
        "report_type": "daily",
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "current_period": current_stats,
        "previous_period": prev_stats,
        "changes": {
            "total_change": calc_change(current_stats["total"], prev_stats["total"]),
            "approved_change": calc_change(
                current_stats["approved"], prev_stats["approved"]
            ),
            "rejected_change": calc_change(
                current_stats["rejected"], prev_stats["rejected"]
            ),
        },
        "lab_stats": lab_stats,
        "user_stats": user_stats,
        "time_slot_stats": time_slot_stats,
    }
