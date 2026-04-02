# -*- coding: utf-8 -*-
# File: auth.py
# Created: 2026-03-23
# Author: zhuimeng
# Description: 认证服务

from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.token import TokenResponse
from app.exceptions.business import AuthError
from app.core.security import verify_password, create_access_token, hash_password
from app.core.config import setting
from app.crud import user as user_crud


async def authenticate_user(
    db: AsyncSession, identifier: str, password: str
) -> TokenResponse:
    if (
        identifier == setting.super_admin.USERNAME
        and password == setting.super_admin.PASSWORD
    ):
        token = create_access_token(-1, extra={"role": 0})
        return TokenResponse(access_token=token)

    user = await user_crud.get_user_by_phone(db, identifier)
    if not user:
        user = await user_crud.get_user_by_email(db, identifier)
    if not user:
        user = await user_crud.get_user_by_name(db, identifier)

    if not user:
        raise AuthError("用户不存在或密码错误")

    if not verify_password(password, user.password_hash):
        raise AuthError("用户不存在或密码错误")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token)
