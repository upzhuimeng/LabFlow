# -*- coding: utf-8 -*-
# File: user.py
# Created: 2026-03-23
# Author: zhuimeng
# Description: User CRUD 操作

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Tuple, List
from datetime import datetime

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_phone(db: AsyncSession, phone: str) -> User | None:
    result = await db.execute(select(User).where(User.phone == phone))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_users(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    role: int | None = None,
    is_active: int | None = None,
    keyword: str | None = None,
) -> Tuple[List[User], int]:
    """获取用户列表"""
    query = select(User)

    if role is not None:
        query = query.where(User.role == role)

    if is_active is not None:
        query = query.where(User.is_active == is_active)

    if keyword:
        query = query.where(
            (User.name.contains(keyword))
            | (User.phone.contains(keyword))
            | (User.email.contains(keyword))
        )

    total_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(total_query)
    total = total_result.scalar_one()

    query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()

    return users, total


async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    password_hash = hash_password(user_in.password)
    user = User(
        name=user_in.name,
        phone=user_in.phone,
        password_hash=password_hash,
        email=user_in.email,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def update_user(db: AsyncSession, user: User, update_data: UserUpdate) -> User:
    """更新用户"""
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if hasattr(user, field):
            setattr(user, field, value)
    user.updated_at = datetime.now()
    await db.commit()
    await db.refresh(user)
    return user


async def update_last_login(db: AsyncSession, user: User) -> None:
    """更新最后登录时间"""
    user.last_login_at = datetime.now()
    await db.commit()
