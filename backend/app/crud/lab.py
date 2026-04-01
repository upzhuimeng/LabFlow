# -*- coding: utf-8 -*-
# File: lab.py
# Description: Lab CRUD 操作

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Tuple, List

from app.models.lab import Lab
from app.schemas.lab import LabCreate, LabUpdate


async def get_lab_by_id(db: AsyncSession, lab_id: int) -> Lab | None:
    """根据ID获取实验室"""
    result = await db.execute(select(Lab).where(Lab.id == lab_id))
    return result.scalar_one_or_none()


async def get_labs(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    status: int | None = None,
    tag_id: int | None = None,
    keyword: str | None = None,
) -> Tuple[List[Lab], int]:
    """获取实验室列表"""
    query = select(Lab)

    if status is not None:
        query = query.where(Lab.status == status)

    if tag_id is not None:
        query = query.where(Lab.tag_id == tag_id)

    if keyword and keyword.strip():
        query = query.where(Lab.name.ilike(f"%{keyword}%"))

    total_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(total_query)
    total = total_result.scalar_one()

    query = query.order_by(Lab.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    labs = result.scalars().all()

    return labs, total


async def create_lab(db: AsyncSession, lab_data: LabCreate) -> Lab:
    """创建实验室"""
    lab = Lab(**lab_data.model_dump())
    db.add(lab)
    await db.commit()
    await db.refresh(lab)
    return lab


async def update_lab(db: AsyncSession, lab: Lab, update_data: LabUpdate) -> Lab:
    """更新实验室"""
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if hasattr(lab, field):
            setattr(lab, field, value)
    await db.commit()
    await db.refresh(lab)
    return lab


async def delete_lab(db: AsyncSession, lab: Lab) -> None:
    """删除实验室（软删除，status=2）"""
    lab.status = 2
    await db.commit()
