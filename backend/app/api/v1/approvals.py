# -*- coding: utf-8 -*-
# File: approvals.py
# Description: 审批路由

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.base import BaseResponse
from app.schemas.approval import ApprovalResponse
from app.crud import approval as approval_crud
from app.services import approval as approval_service
from app.crud import user as user_crud


router = APIRouter(prefix="/api/v1/approvals", tags=["审批管理"])


class ApprovalRequest(BaseModel):
    comment: str | None = None


@router.get("/pending", response_model=BaseResponse)
async def get_pending_approvals(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """获取待我审批的预约列表"""
    result = await approval_service.get_pending_approvals(db, current_user.id)
    return BaseResponse(data=result)


@router.post("/reservations/{reservation_id}/approve", response_model=BaseResponse)
async def approve_reservation(
    reservation_id: int,
    approval_req: ApprovalRequest = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """审批通过预约"""
    try:
        result = await approval_service.approve_reservation(
            db,
            reservation_id,
            current_user.id,
            approval_req.comment if approval_req else None,
        )
        return BaseResponse(message="审批通过", data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reservations/{reservation_id}/reject", response_model=BaseResponse)
async def reject_reservation(
    reservation_id: int,
    approval_req: ApprovalRequest = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """审批拒绝预约"""
    try:
        result = await approval_service.reject_reservation(
            db,
            reservation_id,
            current_user.id,
            approval_req.comment if approval_req else None,
        )
        return BaseResponse(message="已拒绝", data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/reservations/{reservation_id}", response_model=BaseResponse)
async def get_reservation_approvals(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取预约的审批记录"""
    approvals = await approval_crud.get_approvals_by_reservation(db, reservation_id)

    items = []
    for a in approvals:
        approver = await user_crud.get_user_by_id(db, a.approver_id)
        items.append(
            {
                "id": a.id,
                "reservation_id": a.reservation_id,
                "approver_id": a.approver_id,
                "approver_name": approver.name if approver else None,
                "status": a.status,
                "comment": a.comment,
                "approved_at": a.approved_at,
                "created_at": a.created_at,
            }
        )

    return BaseResponse(data=items)
