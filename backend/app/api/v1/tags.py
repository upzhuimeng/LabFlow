# -*- coding: utf-8 -*-
# File: tags.py
# Description: 标签路由

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate, TagResponse
from app.schemas.base import BaseResponse
from app.crud import tag as tag_crud


router = APIRouter(prefix="/api/v1/tags", tags=["标签管理"])


@router.post("/", status_code=201, response_model=BaseResponse)
async def create_tag(
    tag_data: TagCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建标签（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    existing = await tag_crud.get_tag_by_name(db, tag_data.name)
    if existing:
        raise HTTPException(status_code=400, detail="标签名已存在")

    tag = await tag_crud.create_tag(db, tag_data)
    return BaseResponse(
        code=201,
        message="标签创建成功",
        data=TagResponse.model_validate(tag).model_dump(),
    )


@router.get("/", response_model=BaseResponse)
async def list_tags(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取标签列表"""
    skip = (page - 1) * page_size
    tags, total = await tag_crud.get_tags(db, skip, page_size)

    items = [TagResponse.model_validate(tag).model_dump() for tag in tags]

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


@router.get("/{tag_id}", response_model=BaseResponse)
async def get_tag(
    tag_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取标签详情"""
    tag = await tag_crud.get_tag_by_id(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="标签不存在")

    return BaseResponse(data=TagResponse.model_validate(tag).model_dump())


@router.put("/{tag_id}", response_model=BaseResponse)
async def update_tag(
    tag_id: int,
    tag_data: TagUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新标签（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    tag = await tag_crud.get_tag_by_id(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="标签不存在")

    if tag_data.name:
        existing = await tag_crud.get_tag_by_name(db, tag_data.name)
        if existing and existing.id != tag_id:
            raise HTTPException(status_code=400, detail="标签名已存在")

    updated = await tag_crud.update_tag(db, tag, tag_data)
    return BaseResponse(
        message="标签更新成功", data=TagResponse.model_validate(updated).model_dump()
    )


@router.delete("/{tag_id}", response_model=BaseResponse)
async def delete_tag(
    tag_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除标签（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    tag = await tag_crud.get_tag_by_id(db, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="标签不存在")

    await tag_crud.delete_tag(db, tag)
    return BaseResponse(message="标签删除成功")
