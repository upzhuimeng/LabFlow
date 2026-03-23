# -*- coding: utf-8 -*-
# File: deps.py
# Created: 2026-03-13 01:41
# Author: zhuimeng
# Description: 依赖注入

from typing import AsyncGenerator
from fastapi import Request, Depends
from sqlalchemy.ext.asyncio.session import AsyncSession
from app.db.session import Session_Local
from app.models.user import User
from app.exceptions.business import AuthError
from app.core.security import decode_token
from app.crud import user as user_crud


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with Session_Local() as session:
        yield session


async def get_current_user(
    request: Request, db: AsyncSession = Depends(get_db)
) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise AuthError("未登录")

    user_id = decode_token(token)
    if not user_id:
        raise AuthError("无效的令牌")

    user = await user_crud.get_user_by_id(db, user_id)
    if not user:
        raise AuthError("用户不存在")

    return user
