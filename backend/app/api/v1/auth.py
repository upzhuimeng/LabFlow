# -*- coding: utf-8 -*-
# File: auth.py
# Created: 2026-03-23
# Author: zhuimeng
# Description: 认证路由

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.schemas.token import LoginRequest
from app.schemas.base import BaseResponse
from app.services.auth import authenticate_user
from app.core.security import set_token_cookie, clear_token_cookie

router = APIRouter()


@router.post("/login")
async def login(
    req: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> BaseResponse:
    token_data = await authenticate_user(
        db, req.identifier, req.password.get_secret_value()
    )
    set_token_cookie(response, token_data.access_token)
    return BaseResponse(data=token_data.model_dump())


@router.post("/logout")
async def logout(response: Response) -> BaseResponse:
    clear_token_cookie(response)
    return BaseResponse(message="已退出登录")
