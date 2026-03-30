# -*- coding: utf-8 -*-
# File: auth.py
# Created: 2026-03-23
# Author: zhuimeng
# Description: 认证服务

from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import UserCreate
from app.schemas.token import TokenResponse
from app.exceptions.business import AuthError, AlreadyExistsError
from app.core.security import verify_password, create_access_token, hash_password
from app.crud import user as user_crud


async def authenticate_user(
    db: AsyncSession, phone: str | None, email: str | None, password: str
) -> TokenResponse:
    if phone:
        user = await user_crud.get_user_by_phone(db, phone)
    elif email:
        user = await user_crud.get_user_by_email(db, email)
    else:
        raise AuthError("请提供手机号或邮箱")

    if not user:
        raise AuthError("手机号/邮箱或密码错误")

    if not verify_password(password, user.password_hash):
        raise AuthError("手机号/邮箱或密码错误")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


async def register_user(db: AsyncSession, user_in: UserCreate) -> TokenResponse:
    existing = await user_crud.get_user_by_phone(db, user_in.phone)
    if existing:
        raise AlreadyExistsError("该手机号已注册")

    user = await user_crud.create_user(db, user_in)
    token = create_access_token(user.id)
    return TokenResponse(access_token=token)
