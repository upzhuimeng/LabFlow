# -*- coding: utf-8 -*-
# File: reservation.py
# Description: 预约 CRUD 操作

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Tuple, List
from datetime import datetime

from app.models.reservation import Reservation
from app.schemas.reservation import (
    ReservationCreate,
    ReservationUpdate,
    ReservationReapply,
)


async def get_reservation_by_id(
    db: AsyncSession, reservation_id: int
) -> Reservation | None:
    """根据ID获取预约"""
    result = await db.execute(
        select(Reservation).where(Reservation.id == reservation_id)
    )
    return result.scalar_one_or_none()


async def get_reservations_by_user(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    status: int | None = None,
) -> Tuple[List[Reservation], int]:
    """获取用户的预约列表"""
    query = select(Reservation).where(
        Reservation.user_id == user_id, Reservation.is_deleted == 0
    )

    if status is not None:
        query = query.where(Reservation.status == status)

    total_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(total_query)
    total = total_result.scalar_one()

    query = query.order_by(Reservation.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    reservations = result.scalars().all()

    return reservations, total


async def get_all_reservations(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    status: int | None = None,
    lab_id: int | None = None,
    active_only: bool = False,
) -> Tuple[List[Reservation], int]:
    """获取所有预约（管理员用）

    Args:
        active_only: 如果为 True，只返回尚未结束的预约（end_time > now）
    """
    query = select(Reservation).where(Reservation.is_deleted == 0)

    if status is not None:
        query = query.where(Reservation.status == status)

    if lab_id is not None:
        query = query.where(Reservation.lab_id == lab_id)

    if active_only:
        query = query.where(Reservation.end_time > datetime.now())

    total_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(total_query)
    total = total_result.scalar_one()

    query = query.order_by(Reservation.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    reservations = result.scalars().all()

    return reservations, total


async def create_reservation(
    db: AsyncSession, reservation_data: ReservationCreate, user_id: int
) -> Reservation:
    """创建预约"""
    reservation = Reservation(
        user_id=user_id,
        lab_id=reservation_data.lab_id,
        start_time=reservation_data.start_time,
        end_time=reservation_data.end_time,
        purpose=reservation_data.purpose,
        status=0,
    )
    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)
    return reservation


async def update_reservation(
    db: AsyncSession, db_reservation: Reservation, reservation_data: ReservationUpdate
) -> Reservation:
    """更新预约内容（仅限审批中的预约）"""
    update_data = reservation_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_reservation, field, value)

    db_reservation.updated_at = datetime.now()

    await db.commit()
    await db.refresh(db_reservation)
    return db_reservation


async def reapply_reservation(
    db: AsyncSession, db_reservation: Reservation, reservation_data: ReservationReapply
) -> Reservation:
    """重新申请（被拒绝后重新提交）"""
    db_reservation.start_time = reservation_data.start_time
    db_reservation.end_time = reservation_data.end_time
    db_reservation.purpose = reservation_data.purpose
    db_reservation.status = 0
    db_reservation.updated_at = datetime.now()

    await db.commit()
    await db.refresh(db_reservation)
    return db_reservation


async def cancel_reservation(
    db: AsyncSession, db_reservation: Reservation
) -> Reservation:
    """取消预约（状态改为已取消）"""
    db_reservation.status = 3
    db_reservation.updated_at = datetime.now()
    await db.commit()
    await db.refresh(db_reservation)
    return db_reservation


async def check_time_conflict(
    db: AsyncSession,
    lab_id: int,
    start_time: datetime,
    end_time: datetime,
    exclude_id: int | None = None,
) -> list[Reservation]:
    """检查时间冲突，返回冲突的预约列表"""
    query = select(Reservation).where(
        Reservation.lab_id == lab_id,
        Reservation.is_deleted == 0,
        Reservation.status.in_([0, 1]),
        Reservation.start_time < end_time,
        Reservation.end_time > start_time,
    )

    if exclude_id:
        query = query.where(Reservation.id != exclude_id)

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_active_reservations_by_lab(
    db: AsyncSession, lab_id: int, active_only: bool = True
) -> List[Reservation]:
    """获取实验室的有效预约（审批中或已通过，且尚未结束）"""
    query = select(Reservation).where(
        Reservation.lab_id == lab_id,
        Reservation.is_deleted == 0,
        Reservation.status.in_([0, 1]),
    )
    if active_only:
        query = query.where(Reservation.end_time > datetime.now())
    result = await db.execute(query)
    return list(result.scalars().all())


async def invalidate_reservations_by_lab(db: AsyncSession, lab_id: int) -> int:
    """将实验室的所有有效预约标记为失效（status=5）"""
    query = select(Reservation).where(
        Reservation.lab_id == lab_id,
        Reservation.is_deleted == 0,
        Reservation.status.in_([0, 1]),
    )
    result = await db.execute(query)
    reservations = result.scalars().all()

    count = 0
    for res in reservations:
        res.status = 5
        count += 1

    if count > 0:
        await db.commit()
    return count
