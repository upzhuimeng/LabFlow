# -*- coding: utf-8 -*-
# File: users.py
# Description: 用户管理路由

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.lab_user import LabUser
from app.models.tag_user import TagUser
from app.schemas.user import UserUpdate, UserResponse
from app.schemas.base import BaseResponse
from app.crud import user as user_crud


router = APIRouter(prefix="/api/v1/users", tags=["用户管理"])


@router.get("/me", response_model=BaseResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return BaseResponse(data=UserResponse.model_validate(current_user).model_dump())


@router.get("/me/permissions", response_model=BaseResponse)
async def get_current_user_permissions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取当前用户权限（是否为实验室/标签管理员）"""
    lab_result = await db.execute(
        select(LabUser).where(
            LabUser.user_id == current_user.id, LabUser.is_active == 0
        )
    )
    lab_manager = lab_result.scalars().first() is not None

    tag_result = await db.execute(
        select(TagUser).where(TagUser.user_id == current_user.id)
    )
    tag_manager = tag_result.scalars().first() is not None

    return BaseResponse(
        data={
            "is_lab_manager": lab_manager,
            "is_tag_manager": tag_manager,
        }
    )


@router.get("/", response_model=BaseResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[int] = Query(None, ge=0, le=2),
    is_active: Optional[int] = Query(None, ge=0, le=2),
    keyword: Optional[str] = Query(None, max_length=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取用户列表（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    skip = (page - 1) * page_size
    users, total = await user_crud.get_users(
        db, skip, page_size, role, is_active, keyword
    )

    items = [UserResponse.model_validate(u).model_dump() for u in users]

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


@router.get("/{user_id}", response_model=BaseResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取用户详情（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    user = await user_crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    return BaseResponse(data=UserResponse.model_validate(user).model_dump())


@router.put("/{user_id}", response_model=BaseResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新用户（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    user = await user_crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    updated = await user_crud.update_user(db, user, user_data)
    return BaseResponse(
        message="用户更新成功", data=UserResponse.model_validate(updated).model_dump()
    )


@router.put("/me", response_model=BaseResponse)
async def update_current_user(
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新当前用户信息"""
    updated = await user_crud.update_user(db, current_user, user_data)
    return BaseResponse(
        message="信息更新成功", data=UserResponse.model_validate(updated).model_dump()
    )
