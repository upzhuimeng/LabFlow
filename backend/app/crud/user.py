# -*- coding: utf-8 -*-
# File: user.py
# Created: 2026-03-23
# Author: zhuimeng
# Description: User CRUD 操作

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_phone(db: AsyncSession, phone: str) -> User | None:
    result = await db.execute(select(User).where(User.phone == phone))
    return result.scalar_one_or_none()


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
