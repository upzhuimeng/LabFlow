# -*- coding: utf-8 -*-
# File: notifications.py
# Description: 通知路由

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.schemas.base import BaseResponse
from app.crud import notification as notification_crud


router = APIRouter(prefix="/api/v1/notifications", tags=["通知"])


@router.get("/", response_model=BaseResponse)
async def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取通知列表"""
    skip = (page - 1) * page_size
    notifications, total = await notification_crud.get_notifications_by_user(
        db, current_user.id, skip, page_size
    )

    return BaseResponse(
        data={
            "items": [
                NotificationResponse.model_validate(n).model_dump()
                for n in notifications
            ],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size,
            },
        }
    )


@router.get("/unread-count", response_model=BaseResponse)
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取未读通知数量"""
    count = await notification_crud.get_unread_count(db, current_user.id)
    return BaseResponse(data={"count": count})


@router.put("/read-all", response_model=BaseResponse)
async def mark_all_notifications_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """标记全部通知为已读"""
    count = await notification_crud.mark_all_as_read(db, current_user.id)
    return BaseResponse(message=f"已标记 {count} 条通知为已读")


@router.get("/{notification_id}", response_model=BaseResponse)
async def get_notification_detail(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取通知详情"""
    notification = await notification_crud.get_notification_by_id(
        db, notification_id, current_user.id
    )
    if not notification:
        return BaseResponse(code=404, message="通知不存在")
    return BaseResponse(
        data=NotificationResponse.model_validate(notification).model_dump()
    )


@router.put("/{notification_id}/read", response_model=BaseResponse)
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """标记单条通知为已读"""
    success = await notification_crud.mark_as_read(db, notification_id, current_user.id)
    if not success:
        return BaseResponse(code=404, message="通知不存在")
    return BaseResponse(message="已标记为已读")
