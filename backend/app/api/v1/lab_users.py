# -*- coding: utf-8 -*-
# File: lab_users.py
# Description: 实验室负责人管理

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.lab_user import LabUser
from app.schemas.base import BaseResponse
from app.crud import lab as lab_crud


router = APIRouter(prefix="/api/v1/labs", tags=["实验室管理"])


@router.get("/{lab_id}/managers", response_model=BaseResponse)
async def list_lab_managers(
    lab_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取实验室负责人列表"""
    lab = await lab_crud.get_lab_by_id(db, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="实验室不存在")

    query = select(LabUser).where(LabUser.lab_id == lab_id, LabUser.is_active == 0)
    result = await db.execute(query)
    lab_users = result.scalars().all()

    managers = []
    for lu in lab_users:
        user_result = await db.execute(select(User).where(User.id == lu.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            managers.append(
                {
                    "id": lu.id,
                    "user_id": user.id,
                    "name": user.name,
                    "phone": user.phone,
                }
            )

    return BaseResponse(data=managers)


@router.post("/{lab_id}/managers/{user_id}", response_model=BaseResponse)
async def add_lab_manager(
    lab_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """添加实验室负责人（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    lab = await lab_crud.get_lab_by_id(db, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="实验室不存在")

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    existing = await db.execute(
        select(LabUser).where(LabUser.lab_id == lab_id, LabUser.user_id == user_id)
    )
    existing_lab_user = existing.scalar_one_or_none()

    if existing_lab_user:
        if existing_lab_user.is_active == 0:
            raise HTTPException(status_code=400, detail="该用户已是实验室负责人")
        existing_lab_user.is_active = 0
        await db.commit()
        return BaseResponse(message="添加负责人成功")

    lab_user = LabUser(lab_id=lab_id, user_id=user_id, is_active=0)
    db.add(lab_user)
    await db.commit()

    return BaseResponse(message="添加负责人成功")


@router.delete("/{lab_id}/managers/{user_id}", response_model=BaseResponse)
async def remove_lab_manager(
    lab_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """移除实验室负责人（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    result = await db.execute(
        select(LabUser).where(
            LabUser.lab_id == lab_id, LabUser.user_id == user_id, LabUser.is_active == 0
        )
    )
    lab_user = result.scalar_one_or_none()

    if not lab_user:
        raise HTTPException(status_code=404, detail="该用户不是实验室负责人")

    lab_user.is_active = 1
    await db.commit()

    return BaseResponse(message="移除负责人成功")
