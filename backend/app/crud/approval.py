# -*- coding: utf-8 -*-
# File: approval.py
# Description: Approval CRUD 操作

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.models.approval import Approval


async def get_approvals_by_reservation(
    db: AsyncSession, reservation_id: int
) -> List[Approval]:
    """获取预约的所有审批记录"""
    result = await db.execute(
        select(Approval)
        .where(Approval.reservation_id == reservation_id)
        .order_by(Approval.created_at.desc())
    )
    return list(result.scalars().all())


async def get_approval_by_approver(
    db: AsyncSession, reservation_id: int, approver_id: int, level: int
) -> Approval | None:
    """获取审批人已做出的审批"""
    result = await db.execute(
        select(Approval).where(
            Approval.reservation_id == reservation_id,
            Approval.approver_id == approver_id,
            Approval.level == level,
        )
    )
    return result.scalar_one_or_none()


async def create_approval(
    db: AsyncSession,
    reservation_id: int,
    approver_id: int,
    level: int,
    status: int,
    comment: str | None = None,
) -> Approval:
    """创建审批记录"""
    from datetime import datetime

    approval = Approval(
        reservation_id=reservation_id,
        approver_id=approver_id,
        level=level,
        status=status,
        comment=comment,
        approved_at=datetime.now(),
    )
    db.add(approval)
    await db.commit()
    await db.refresh(approval)
    return approval
