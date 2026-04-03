# -*- coding: utf-8 -*-
# File: reservation.py
# Description: 预约业务逻辑

from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from datetime import datetime, timezone

from app.crud import reservation as reservation_crud
from app.crud import lab as lab_crud
from app.crud import user as user_crud
from app.crud import approval as approval_crud
from app.schemas.reservation import (
    ReservationCreate,
    ReservationUpdate,
    ReservationReapply,
)


async def create_reservation(
    db: AsyncSession, reservation_data: ReservationCreate, user_id: int
) -> Dict[str, Any]:
    """创建预约"""
    # 1. 检查实验室是否存在
    lab = await lab_crud.get_lab_by_id(db, reservation_data.lab_id)
    if not lab:
        raise ValueError("实验室不存在")

    # 2. 检查实验室状态
    if lab.status != 0:
        raise ValueError("实验室当前不可预约")

    # 3. 检查时间合法性
    if reservation_data.start_time >= reservation_data.end_time:
        raise ValueError("开始时间必须早于结束时间")

    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    if reservation_data.start_time < now_utc:
        raise ValueError("不能预约过去的时间")

    # 4. 检查时间冲突
    conflicts = await reservation_crud.check_time_conflict(
        db,
        reservation_data.lab_id,
        reservation_data.start_time,
        reservation_data.end_time,
    )
    if conflicts:
        conflict_times = ", ".join(
            f"{c.start_time.strftime('%m-%d %H:%M')}~{c.end_time.strftime('%H:%M')}"
            for c in conflicts
        )
        raise ValueError(f"该时间段已被预约：{conflict_times}")

    # 5. 创建预约
    reservation = await reservation_crud.create_reservation(
        db, reservation_data, user_id
    )

    return {
        "id": reservation.id,
        "lab_id": reservation.lab_id,
        "lab_name": lab.name,
        "start_time": reservation.start_time,
        "end_time": reservation.end_time,
        "purpose": reservation.purpose,
        "status": reservation.status,
        "created_at": reservation.created_at,
    }


async def get_user_reservations(
    db: AsyncSession,
    user_id: int,
    page: int = 1,
    page_size: int = 20,
    status: int | None = None,
) -> Dict[str, Any]:
    """获取用户的预约列表"""
    skip = (page - 1) * page_size
    reservations, total = await reservation_crud.get_reservations_by_user(
        db, user_id, skip, page_size, status
    )

    items = []
    for r in reservations:
        lab = await lab_crud.get_lab_by_id(db, r.lab_id)
        user = await user_crud.get_user_by_id(db, r.user_id)
        approvals = await approval_crud.get_approvals_by_reservation(db, r.id)
        approval_comment = approvals[0].comment if approvals else None
        items.append(
            {
                "id": r.id,
                "user_id": r.user_id,
                "user_name": user.name if user else None,
                "lab_id": r.lab_id,
                "lab_name": lab.name if lab else None,
                "start_time": r.start_time,
                "end_time": r.end_time,
                "purpose": r.purpose,
                "status": r.status,
                "created_at": r.created_at,
                "approval_comment": approval_comment,
            }
        )

    return {
        "items": items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size,
        },
    }


async def get_reservation_detail(
    db: AsyncSession, reservation_id: int, current_user_id: int
) -> Dict[str, Any]:
    """获取预约详情（本人或管理员）"""
    reservation = await reservation_crud.get_reservation_by_id(db, reservation_id)
    if not reservation:
        raise ValueError("预约不存在")

    # 获取当前用户判断是否是管理员
    current_user = await user_crud.get_user_by_id(db, current_user_id)
    is_admin = current_user.role in [0, 1] if current_user else False

    # 权限检查
    if not is_admin and reservation.user_id != current_user_id:
        raise ValueError("无权查看此预约")

    lab = await lab_crud.get_lab_by_id(db, reservation.lab_id)
    user = await user_crud.get_user_by_id(db, reservation.user_id)

    return {
        "id": reservation.id,
        "user_id": reservation.user_id,
        "user_name": user.name if user else None,
        "lab_id": reservation.lab_id,
        "lab_name": lab.name if lab else None,
        "start_time": reservation.start_time,
        "end_time": reservation.end_time,
        "purpose": reservation.purpose,
        "status": reservation.status,
        "created_at": reservation.created_at,
        "updated_at": reservation.updated_at,
    }


async def update_reservation(
    db: AsyncSession,
    reservation_id: int,
    reservation_data: ReservationUpdate,
    current_user_id: int,
) -> Dict[str, Any]:
    """更新预约内容（仅限审批中的预约，本人可操作）"""
    reservation = await reservation_crud.get_reservation_by_id(db, reservation_id)
    if not reservation:
        raise ValueError("预约不存在")

    # 权限检查：只能修改自己的预约
    if reservation.user_id != current_user_id:
        raise ValueError("无权修改此预约")

    # 状态检查：只有审批中的才能修改
    if reservation.status != 0:
        raise ValueError("当前状态无法修改")

    # 如果修改了时间，检查冲突
    if reservation_data.start_time or reservation_data.end_time:
        start_time = reservation_data.start_time or reservation.start_time
        end_time = reservation_data.end_time or reservation.end_time

        if start_time >= end_time:
            raise ValueError("开始时间必须早于结束时间")

        if start_time < datetime.now(timezone.utc).replace(tzinfo=None):
            raise ValueError("不能预约过去的时间")

        conflicts = await reservation_crud.check_time_conflict(
            db, reservation.lab_id, start_time, end_time, exclude_id=reservation_id
        )
        if conflicts:
            conflict_times = ", ".join(
                f"{c.start_time.strftime('%m-%d %H:%M')}~{c.end_time.strftime('%H:%M')}"
                for c in conflicts
            )
            raise ValueError(f"该时间段已被预约：{conflict_times}")

    # 更新预约
    updated = await reservation_crud.update_reservation(
        db, reservation, reservation_data
    )

    return {
        "id": updated.id,
        "lab_id": updated.lab_id,
        "start_time": updated.start_time,
        "end_time": updated.end_time,
        "purpose": updated.purpose,
        "status": updated.status,
        "updated_at": updated.updated_at,
    }


async def reapply_reservation(
    db: AsyncSession,
    reservation_id: int,
    reservation_data: ReservationReapply,
    current_user_id: int,
) -> Dict[str, Any]:
    """重新申请（被拒绝后重新提交，本人可操作）"""
    reservation = await reservation_crud.get_reservation_by_id(db, reservation_id)
    if not reservation:
        raise ValueError("预约不存在")

    # 权限检查：只能操作自己的预约
    if reservation.user_id != current_user_id:
        raise ValueError("无权操作此预约")

    # 状态检查：只有被拒绝的才能重新申请
    if reservation.status != 2:
        raise ValueError("只有被拒绝的预约才能重新申请")

    # 检查实验室是否存在
    lab = await lab_crud.get_lab_by_id(db, reservation.lab_id)
    if not lab:
        raise ValueError("实验室不存在")

    # 检查实验室状态
    if lab.status != 0:
        raise ValueError("实验室当前不可预约")

    # 检查时间合法性
    if reservation_data.start_time >= reservation_data.end_time:
        raise ValueError("开始时间必须早于结束时间")

    if reservation_data.start_time < datetime.now(timezone.utc).replace(tzinfo=None):
        raise ValueError("不能预约过去的时间")

    # 检查时间冲突
    conflicts = await reservation_crud.check_time_conflict(
        db,
        reservation.lab_id,
        reservation_data.start_time,
        reservation_data.end_time,
        exclude_id=reservation_id,
    )
    if conflicts:
        conflict_times = ", ".join(
            f"{c.start_time.strftime('%m-%d %H:%M')}~{c.end_time.strftime('%H:%M')}"
            for c in conflicts
        )
        raise ValueError(f"该时间段已被预约：{conflict_times}")

    # 重新申请
    updated = await reservation_crud.reapply_reservation(
        db, reservation, reservation_data
    )

    return {
        "id": updated.id,
        "lab_id": updated.lab_id,
        "lab_name": lab.name,
        "start_time": updated.start_time,
        "end_time": updated.end_time,
        "purpose": updated.purpose,
        "status": updated.status,
        "updated_at": updated.updated_at,
        "message": "重新申请成功，等待审批",
    }


async def cancel_reservation(
    db: AsyncSession, reservation_id: int, current_user_id: int
) -> None:
    """取消预约（本人或管理员）"""
    reservation = await reservation_crud.get_reservation_by_id(db, reservation_id)
    if not reservation:
        raise ValueError("预约不存在")

    # 获取当前用户判断是否是管理员
    current_user = await user_crud.get_user_by_id(db, current_user_id)
    is_admin = current_user.role in [0, 1] if current_user else False

    # 权限检查
    if not is_admin and reservation.user_id != current_user_id:
        raise ValueError("无权取消此预约")

    # 状态检查：只有审批中或已通过的才能取消
    if reservation.status not in [0, 1]:
        raise ValueError("当前状态无法取消")

    await reservation_crud.cancel_reservation(db, reservation)
