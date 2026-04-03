# -*- coding: utf-8 -*-
# File: approval.py
# Description: 审批业务逻辑

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Dict, Any

from app.models.reservation import Reservation
from app.models.lab_user import LabUser
from app.crud import approval as approval_crud
from app.crud import lab as lab_crud
from app.crud import user as user_crud
from app.crud import notification as notification_crud


async def is_lab_manager(db: AsyncSession, user_id: int, lab_id: int) -> bool:
    """检查用户是否是实验室负责人"""
    result = await db.execute(
        select(LabUser).where(
            LabUser.user_id == user_id, LabUser.lab_id == lab_id, LabUser.is_active == 0
        )
    )
    return result.scalar_one_or_none() is not None


async def count_lab_managers(db: AsyncSession, lab_id: int) -> int:
    """统计实验室负责人数量"""
    result = await db.execute(
        select(func.count())
        .select_from(LabUser)
        .where(LabUser.lab_id == lab_id, LabUser.is_active == 0)
    )
    return result.scalar() or 0


async def can_approve(
    db: AsyncSession, user_id: int, lab_id: int, applicant_id: int
) -> tuple[bool, str]:
    """检查用户是否可以审批该预约

    Returns:
        (can_approve, reason)
    """
    if not await is_lab_manager(db, user_id, lab_id):
        return False, "您不是该实验室的负责人"

    if user_id == applicant_id:
        manager_count = await count_lab_managers(db, lab_id)
        if manager_count > 1:
            return False, "负责人不能审批自己的申请"

    return True, ""


async def approve_reservation(
    db: AsyncSession,
    reservation_id: int,
    approver_id: int,
    comment: str | None = None,
) -> Dict[str, Any]:
    """审批通过预约"""
    reservation = await db.execute(
        select(Reservation).where(
            Reservation.id == reservation_id,
            Reservation.is_deleted == 0,
        )
    )
    reservation = reservation.scalar_one_or_none()

    if not reservation:
        raise ValueError("预约不存在")

    if reservation.status != 0:
        raise ValueError("当前状态无法审批")

    can_approve_flag, reason = await can_approve(
        db, approver_id, reservation.lab_id, reservation.user_id
    )
    if not can_approve_flag:
        raise ValueError(reason)

    existing = await approval_crud.get_approval_by_approver(
        db, reservation_id, approver_id
    )
    if existing:
        raise ValueError("您已审批过该预约")

    await approval_crud.create_approval(db, reservation_id, approver_id, 0, comment)

    reservation.status = 1
    await db.flush()
    await db.refresh(reservation)

    await db.commit()

    await notification_crud.create_notification(
        db,
        user_id=reservation.user_id,
        title="预约审批通过",
        content=f"您的预约（{reservation.start_time.strftime('%Y-%m-%d %H:%M')} 至 {reservation.end_time.strftime('%H:%M')}）已通过审批",
        notif_type=1,
        related_id=reservation_id,
    )

    return {
        "id": reservation.id,
        "status": reservation.status,
        "message": "审批通过",
    }


async def reject_reservation(
    db: AsyncSession,
    reservation_id: int,
    approver_id: int,
    comment: str | None = None,
) -> Dict[str, Any]:
    """审批拒绝预约"""
    reservation = await db.execute(
        select(Reservation).where(
            Reservation.id == reservation_id,
            Reservation.is_deleted == 0,
        )
    )
    reservation = reservation.scalar_one_or_none()

    if not reservation:
        raise ValueError("预约不存在")

    if reservation.status != 0:
        raise ValueError("当前状态无法审批")

    can_approve_flag, reason = await can_approve(
        db, approver_id, reservation.lab_id, reservation.user_id
    )
    if not can_approve_flag:
        raise ValueError(reason)

    existing = await approval_crud.get_approval_by_approver(
        db, reservation_id, approver_id
    )
    if existing:
        raise ValueError("您已审批过该预约")

    await approval_crud.create_approval(db, reservation_id, approver_id, 1, comment)

    reservation.status = 2
    await db.flush()
    await db.refresh(reservation)

    await db.commit()

    reject_reason = comment or "无"
    await notification_crud.create_notification(
        db,
        user_id=reservation.user_id,
        title="预约审批被拒绝",
        content=f"您的预约（{reservation.start_time.strftime('%Y-%m-%d %H:%M')} 至 {reservation.end_time.strftime('%H:%M')}）已被拒绝。原因：{reject_reason}",
        notif_type=1,
        related_id=reservation_id,
    )

    return {
        "id": reservation.id,
        "status": reservation.status,
        "message": "审批已拒绝",
    }


async def get_pending_approvals(
    db: AsyncSession, approver_id: int
) -> list[Dict[str, Any]]:
    """获取待审批的预约列表"""
    labs_result = await db.execute(
        select(LabUser.lab_id).where(
            LabUser.user_id == approver_id, LabUser.is_active == 0
        )
    )
    managed_lab_ids = [r[0] for r in labs_result.fetchall()]

    if not managed_lab_ids:
        return []

    reservations_result = await db.execute(
        select(Reservation).where(
            Reservation.status == 0,
            Reservation.is_deleted == 0,
            Reservation.lab_id.in_(managed_lab_ids),
        )
    )
    all_reservations = reservations_result.scalars().all()

    pending = []
    for res in all_reservations:
        can_approve_flag, _ = await can_approve(
            db, approver_id, res.lab_id, res.user_id
        )
        if not can_approve_flag:
            continue

        lab = await lab_crud.get_lab_by_id(db, res.lab_id)
        user = await user_crud.get_user_by_id(db, res.user_id)
        pending.append(
            {
                "id": res.id,
                "user_name": user.name if user else None,
                "lab_id": res.lab_id,
                "lab_name": lab.name if lab else None,
                "start_time": res.start_time,
                "end_time": res.end_time,
                "purpose": res.purpose,
                "status": res.status,
                "created_at": res.created_at,
            }
        )

    return pending


async def get_all_approvals(db: AsyncSession, approver_id: int) -> list[Dict[str, Any]]:
    """获取所有我负责的预约列表（含已审批、已拒绝等）"""
    labs_result = await db.execute(
        select(LabUser.lab_id).where(
            LabUser.user_id == approver_id, LabUser.is_active == 0
        )
    )
    managed_lab_ids = [r[0] for r in labs_result.fetchall()]

    if not managed_lab_ids:
        return []

    reservations_result = await db.execute(
        select(Reservation).where(
            Reservation.is_deleted == 0,
            Reservation.lab_id.in_(managed_lab_ids),
        )
    )
    all_reservations = reservations_result.scalars().all()

    result = []
    for res in all_reservations:
        lab = await lab_crud.get_lab_by_id(db, res.lab_id)
        user = await user_crud.get_user_by_id(db, res.user_id)
        my_approval = await approval_crud.get_approval_by_approver(
            db, res.id, approver_id
        )
        result.append(
            {
                "id": res.id,
                "user_name": user.name if user else None,
                "lab_id": res.lab_id,
                "lab_name": lab.name if lab else None,
                "start_time": res.start_time,
                "end_time": res.end_time,
                "purpose": res.purpose,
                "status": res.status,
                "created_at": res.created_at,
                "approval_comment": my_approval.comment if my_approval else None,
            }
        )

    return result
