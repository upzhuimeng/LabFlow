# -*- coding: utf-8 -*-
# File: reservations.py
# Description: 预约路由

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.api.deps import get_db, get_current_user
from app.schemas.reservation import (
    ReservationCreate,
    ReservationUpdate,
    ReservationReapply,
)
from app.schemas.base import BaseResponse
from app.services import reservation as reservation_service
from app.models.user import User

router = APIRouter(prefix="/api/v1/reservations", tags=["预约管理"])


@router.post("/", status_code=201, response_model=BaseResponse)
async def create_reservation(
    reservation_data: ReservationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建预约"""
    try:
        result = await reservation_service.create_reservation(
            db, reservation_data, current_user.id
        )
        return BaseResponse(code=201, message="预约提交成功，等待审批", data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=BaseResponse)
async def list_reservations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[int] = Query(None, ge=0, le=4),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """查看预约列表"""
    is_admin = current_user.role in [0, 1]

    if is_admin:
        from app.crud.reservation import get_all_reservations

        skip = (page - 1) * page_size
        reservations, total = await get_all_reservations(db, skip, page_size, status)

        items = []
        for r in reservations:
            from app.crud.user import get_user_by_id
            from app.crud.lab import get_lab_by_id
            from app.crud.approval import get_approvals_by_reservation

            user = await get_user_by_id(db, r.user_id)
            lab = await get_lab_by_id(db, r.lab_id)
            approvals = await get_approvals_by_reservation(db, r.id)
            approval_comment = approvals[0].comment if approvals else None
            items.append(
                {
                    "id": r.id,
                    "user_name": user.name if user else None,
                    "lab_name": lab.name if lab else None,
                    "start_time": r.start_time,
                    "end_time": r.end_time,
                    "status": r.status,
                    "created_at": r.created_at,
                    "approval_comment": approval_comment,
                }
            )

        return BaseResponse(
            data={
                "items": items,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total": total,
                    "total_pages": (total + page_size - 1) // page_size,
                },
            }
        )

    result = await reservation_service.get_user_reservations(
        db, current_user.id, page, page_size, status
    )
    return BaseResponse(data=result)


@router.get("/{reservation_id}", response_model=BaseResponse)
async def get_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """查看预约详情（本人或管理员）"""
    try:
        result = await reservation_service.get_reservation_detail(
            db, reservation_id, current_user.id
        )
        return BaseResponse(data=result)
    except ValueError as e:
        if "不存在" in str(e):
            raise HTTPException(status_code=404, detail=str(e))
        if "无权" in str(e):
            raise HTTPException(status_code=403, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{reservation_id}", response_model=BaseResponse)
async def update_reservation(
    reservation_id: int,
    reservation_data: ReservationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新预约内容（仅限审批中的预约，本人可操作）"""
    try:
        result = await reservation_service.update_reservation(
            db, reservation_id, reservation_data, current_user.id
        )
        return BaseResponse(data=result, message="预约更新成功")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{reservation_id}/reapply", response_model=BaseResponse)
async def reapply_reservation(
    reservation_id: int,
    reservation_data: ReservationReapply,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """重新申请（被拒绝后修改并重新提交，本人可操作）"""
    try:
        result = await reservation_service.reapply_reservation(
            db, reservation_id, reservation_data, current_user.id
        )
        return BaseResponse(data=result, message="重新申请成功")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{reservation_id}", response_model=BaseResponse)
async def cancel_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """取消预约（本人或管理员）"""
    try:
        await reservation_service.cancel_reservation(
            db, reservation_id, current_user.id
        )
        return BaseResponse(message="预约已取消")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
