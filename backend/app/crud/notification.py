# -*- coding: utf-8 -*-
# File: notification.py
# Description: Notification CRUD operations

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Tuple

from app.models.notification import Notification


async def create_notification(
    db: AsyncSession,
    user_id: int,
    title: str,
    content: str,
    notif_type: int = 3,
    related_id: int | None = None,
    attachment: str | None = None,
) -> Notification:
    """创建通知"""
    notification = Notification(
        user_id=user_id,
        title=title,
        content=content,
        type=notif_type,
        related_id=related_id,
        attachment=attachment,
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


async def get_notifications_by_user(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
) -> Tuple[List[Notification], int]:
    """获取用户通知列表"""
    query = select(Notification).where(Notification.user_id == user_id)

    total_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(total_query)
    total = total_result.scalar_one()

    query = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    notifications = result.scalars().all()

    return notifications, total


async def get_unread_count(db: AsyncSession, user_id: int) -> int:
    """获取未读通知数量"""
    query = (
        select(func.count())
        .select_from(Notification)
        .where(Notification.user_id == user_id, Notification.is_read == 0)
    )
    result = await db.execute(query)
    return result.scalar_one()


async def get_notification_by_id(
    db: AsyncSession,
    notification_id: int,
    user_id: int,
) -> Notification | None:
    """获取单条通知详情"""
    query = select(Notification).where(
        Notification.id == notification_id, Notification.user_id == user_id
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def mark_as_read(db: AsyncSession, notification_id: int, user_id: int) -> bool:
    """标记单条通知为已读"""
    query = select(Notification).where(
        Notification.id == notification_id, Notification.user_id == user_id
    )
    result = await db.execute(query)
    notification = result.scalar_one_or_none()

    if not notification:
        return False

    notification.is_read = 1
    await db.commit()
    return True


async def mark_all_as_read(db: AsyncSession, user_id: int) -> int:
    """标记全部通知为已读，返回更新数量"""
    query = select(Notification).where(
        Notification.user_id == user_id, Notification.is_read == 0
    )
    result = await db.execute(query)
    notifications = result.scalars().all()

    count = 0
    for notification in notifications:
        notification.is_read = 1
        count += 1

    if count > 0:
        await db.commit()
    return count
