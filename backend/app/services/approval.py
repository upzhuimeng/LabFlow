# -*- coding: utf-8 -*-
# File: approval.py
# Description: 审批业务逻辑

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any

from app.models.reservation import Reservation
from app.models.lab import Lab
from app.models.lab_user import LabUser
from app.models.tag_user import TagUser
from app.models.tag import Tag
from app.models.user import User
from app.models.approval import Approval
from app.crud import approval as approval_crud
from app.crud import lab as lab_crud
from app.crud import user as user_crud


async def is_lab_manager(db: AsyncSession, user_id: int, lab_id: int) -> bool:
    """检查用户是否是实验室负责人"""
    result = await db.execute(
        select(LabUser).where(
            LabUser.user_id == user_id, LabUser.lab_id == lab_id, LabUser.is_active == 0
        )
    )
    return result.scalar_one_or_none() is not None


async def is_tag_manager(db: AsyncSession, user_id: int, tag_id: int) -> bool:
    """检查用户是否是标签负责人"""
    result = await db.execute(
        select(TagUser).where(TagUser.user_id == user_id, TagUser.tag_id == tag_id)
    )
    return result.scalar_one_or_none() is not None


async def approve_reservation(
    db: AsyncSession,
    reservation_id: int,
    approver_id: int,
    level: int,
    comment: str | None = None,
) -> Dict[str, Any]:
    """审批通过预约"""
    reservation = await db.execute(
        select(Reservation).where(Reservation.id == reservation_id)
    )
    reservation = reservation.scalar_one_or_none()

    if not reservation:
        raise ValueError("预约不存在")

    if reservation.status != 0:
        raise ValueError("当前状态无法审批")

    if level == 1:
        if reservation.current_level != 1:
            raise ValueError("当前不在一级审批阶段")
        manager = await is_lab_manager(db, approver_id, reservation.lab_id)
        if not manager:
            raise ValueError("您不是该实验室的负责人")
    elif level == 2:
        if reservation.current_level != 2:
            raise ValueError("当前不在二级审批阶段")
        lab = await lab_crud.get_lab_by_id(db, reservation.lab_id)
        if not lab:
            raise ValueError("实验室不存在")
        manager = await is_tag_manager(db, approver_id, lab.tag_id)
        if not manager:
            raise ValueError("您不是该标签的负责人")
    else:
        raise ValueError("无效的审批级别")

    existing = await approval_crud.get_approval_by_approver(
        db, reservation_id, approver_id, level
    )
    if existing:
        raise ValueError("您已审批过该预约")

    await approval_crud.create_approval(
        db, reservation_id, approver_id, level, 0, comment
    )

    if level == 1:
        reservation.current_level = 2
    elif level == 2:
        reservation.current_level = 3
        reservation.status = 1

    await db.commit()

    return {
        "id": reservation.id,
        "status": reservation.status,
        "current_level": reservation.current_level,
        "message": "审批通过",
    }


async def reject_reservation(
    db: AsyncSession,
    reservation_id: int,
    approver_id: int,
    level: int,
    comment: str | None = None,
) -> Dict[str, Any]:
    """审批拒绝预约"""
    reservation = await db.execute(
        select(Reservation).where(Reservation.id == reservation_id)
    )
    reservation = reservation.scalar_one_or_none()

    if not reservation:
        raise ValueError("预约不存在")

    if reservation.status != 0:
        raise ValueError("当前状态无法审批")

    if level == 1:
        if reservation.current_level != 1:
            raise ValueError("当前不在一级审批阶段")
        manager = await is_lab_manager(db, approver_id, reservation.lab_id)
        if not manager:
            raise ValueError("您不是该实验室的负责人")
    elif level == 2:
        if reservation.current_level != 2:
            raise ValueError("当前不在二级审批阶段")
        lab = await lab_crud.get_lab_by_id(db, reservation.lab_id)
        if not lab:
            raise ValueError("实验室不存在")
        manager = await is_tag_manager(db, approver_id, lab.tag_id)
        if not manager:
            raise ValueError("您不是该标签的负责人")
    else:
        raise ValueError("无效的审批级别")

    existing = await approval_crud.get_approval_by_approver(
        db, reservation_id, approver_id, level
    )
    if existing:
        raise ValueError("您已审批过该预约")

    await approval_crud.create_approval(
        db, reservation_id, approver_id, level, 1, comment
    )

    reservation.status = 2
    reservation.current_level = level

    await db.commit()

    return {
        "id": reservation.id,
        "status": reservation.status,
        "current_level": reservation.current_level,
        "message": "审批已拒绝",
    }


async def get_pending_approvals(db: AsyncSession, approver_id: int) -> Dict[str, Any]:
    """获取待审批的预约列表"""
    labs_result = await db.execute(
        select(LabUser.lab_id).where(
            LabUser.user_id == approver_id, LabUser.is_active == 0
        )
    )
    managed_lab_ids = [r[0] for r in labs_result.fetchall()]

    tags_result = await db.execute(
        select(TagUser.tag_id).where(TagUser.user_id == approver_id)
    )
    managed_tag_ids = [r[0] for r in tags_result.fetchall()]

    reservations_result = await db.execute(
        select(Reservation).where(
            Reservation.status == 0, Reservation.current_level.in_([1, 2])
        )
    )
    all_reservations = reservations_result.scalars().all()

    pending_level1 = []
    pending_level2 = []

    for res in all_reservations:
        if res.current_level == 1 and res.lab_id in managed_lab_ids:
            lab = await lab_crud.get_lab_by_id(db, res.lab_id)
            user = await user_crud.get_user_by_id(db, res.user_id)
            pending_level1.append(
                {
                    "id": res.id,
                    "user_name": user.name if user else None,
                    "lab_id": res.lab_id,
                    "lab_name": lab.name if lab else None,
                    "start_time": res.start_time,
                    "end_time": res.end_time,
                    "purpose": res.purpose,
                    "created_at": res.created_at,
                }
            )
        elif res.current_level == 2:
            lab = await lab_crud.get_lab_by_id(db, res.lab_id)
            if lab and lab.tag_id in managed_tag_ids:
                user = await user_crud.get_user_by_id(db, res.user_id)
                pending_level2.append(
                    {
                        "id": res.id,
                        "user_name": user.name if user else None,
                        "lab_id": res.lab_id,
                        "lab_name": lab.name if lab else None,
                        "start_time": res.start_time,
                        "end_time": res.end_time,
                        "purpose": res.purpose,
                        "created_at": res.created_at,
                    }
                )

    return {"level1_pending": pending_level1, "level2_pending": pending_level2}
