# -*- coding: utf-8 -*-
# File: tags.py
# Description: 标签 API 路由

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.schemas.tag import TagCreate
from app.schemas.base import BaseResponse
from app.services import tag as tag_service
from app.models.user import User

router = APIRouter(prefix="/api/v1/tags", tags=["标签管理"])

@router.post("/", status_code=201, response_model=BaseResponse)
async def create_tag(
        tag_data: TagCreate,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """创建标签（仅管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    try:
        result = await tag_service.create_tag(db, tag_data)
        return BaseResponse(
            code=201,
            message="标签创建成功",
            data=result
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=BaseResponse)
async def list_tags(
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=200),
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """获取标签列表"""
    tags = await tag_service.get_tags(db, skip, limit)
    return BaseResponse(
        code=200,
        message="success",
        data=tags
    )