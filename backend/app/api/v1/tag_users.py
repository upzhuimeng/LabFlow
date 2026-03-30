# -*- coding: utf-8 -*-
# File: tag_users.py
# Description: 标签负责人管理

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.tag_user import TagUser
from app.models.tag import Tag
from app.schemas.base import BaseResponse
from app.crud import tag as tag_crud


router = APIRouter(prefix="/api/v1/tags", tags=["标签管理"])


@router.get("/{tag_id}/managers", response_model=BaseResponse)
async def list_tag_managers(
    tag_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取标签负责人列表"""
    tag = await tag_crud.get_tag_by_id(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="标签不存在")

    query = select(TagUser).where(TagUser.tag_id == tag_id)
    result = await db.execute(query)
    tag_users = result.scalars().all()

    managers = []
    for tu in tag_users:
        user_result = await db.execute(select(User).where(User.id == tu.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            managers.append(
                {
                    "id": tu.id,
                    "user_id": user.id,
                    "name": user.name,
                    "phone": user.phone,
                }
            )

    return BaseResponse(data=managers)


@router.post("/{tag_id}/managers/{user_id}", response_model=BaseResponse)
async def add_tag_manager(
    tag_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """添加标签负责人（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    tag = await tag_crud.get_tag_by_id(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="标签不存在")

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    existing = await db.execute(
        select(TagUser).where(TagUser.tag_id == tag_id, TagUser.user_id == user_id)
    )
    existing_tag_user = existing.scalar_one_or_none()

    if existing_tag_user:
        return BaseResponse(message="该用户已是标签负责人")

    tag_user = TagUser(tag_id=tag_id, user_id=user_id)
    db.add(tag_user)
    await db.commit()

    return BaseResponse(message="添加负责人成功")


@router.delete("/{tag_id}/managers/{user_id}", response_model=BaseResponse)
async def remove_tag_manager(
    tag_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """移除标签负责人（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    result = await db.execute(
        select(TagUser).where(TagUser.tag_id == tag_id, TagUser.user_id == user_id)
    )
    tag_user = result.scalar_one_or_none()

    if not tag_user:
        raise HTTPException(status_code=404, detail="该用户不是标签负责人")

    await db.delete(tag_user)
    await db.commit()

    return BaseResponse(message="移除负责人成功")
