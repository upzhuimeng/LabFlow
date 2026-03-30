# -*- coding: utf-8 -*-
# File: labs.py
# Description: 实验室路由

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.lab import LabCreate, LabUpdate, LabResponse
from app.schemas.base import BaseResponse
from app.crud import lab as lab_crud


router = APIRouter(prefix="/api/v1/labs", tags=["实验室管理"])


@router.post("/", status_code=201, response_model=BaseResponse)
async def create_lab(
    lab_data: LabCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建实验室（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    lab = await lab_crud.create_lab(db, lab_data)
    return BaseResponse(
        code=201,
        message="实验室创建成功",
        data=LabResponse.model_validate(lab).model_dump(),
    )


@router.get("/", response_model=BaseResponse)
async def list_labs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[int] = Query(None, ge=0, le=2),
    tag_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取实验室列表"""
    skip = (page - 1) * page_size
    labs, total = await lab_crud.get_labs(db, skip, page_size, status, tag_id)

    items = [LabResponse.model_validate(lab).model_dump() for lab in labs]

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


@router.get("/{lab_id}", response_model=BaseResponse)
async def get_lab(
    lab_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取实验室详情"""
    lab = await lab_crud.get_lab_by_id(db, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="实验室不存在")

    return BaseResponse(data=LabResponse.model_validate(lab).model_dump())


@router.put("/{lab_id}", response_model=BaseResponse)
async def update_lab(
    lab_id: int,
    lab_data: LabUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新实验室（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    lab = await lab_crud.get_lab_by_id(db, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="实验室不存在")

    updated = await lab_crud.update_lab(db, lab, lab_data)
    return BaseResponse(
        message="实验室更新成功", data=LabResponse.model_validate(updated).model_dump()
    )


@router.delete("/{lab_id}", response_model=BaseResponse)
async def delete_lab(
    lab_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除实验室（管理员，软删除）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    lab = await lab_crud.get_lab_by_id(db, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="实验室不存在")

    await lab_crud.delete_lab(db, lab)
    return BaseResponse(message="实验室删除成功")
