# -*- coding: utf-8 -*-
# File: lab.py
# Description: Lab CRUD 操作

from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Tuple, Sequence

from app.models.lab import Lab
from app.models.lab_user import LabUser
from app.models.user import User
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
    keyword: str | None = None,
) -> Tuple[Sequence[Lab], int]:
    """获取实验室列表"""
    query = select(Lab)

    if status is not None:
        query = query.where(Lab.status == status)

    if keyword and keyword.strip():
        query = query.where(Lab.name.ilike(f"%{keyword}%"))

    total_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(total_query)
    total = total_result.scalar() or 0

    query = query.order_by(Lab.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    labs = result.scalars().all()

    return labs, total


async def create_lab(
    db: AsyncSession, lab_data: LabCreate, manager_user_id: int | None = None
) -> Lab:
    """创建实验室"""
    lab_dict = lab_data.model_dump()
    manager_user_id = lab_dict.pop("manager_user_id", None)

    lab = Lab(**lab_dict)
    db.add(lab)
    await db.commit()
    await db.refresh(lab)

    if manager_user_id:
        lab_user = LabUser(
            lab_id=lab.id,
            user_id=manager_user_id,
            created_at=datetime.now(),
            is_active=0,
        )
        db.add(lab_user)
        await db.commit()

    return lab


async def update_lab(
    db: AsyncSession,
    lab: Lab,
    update_data: LabUpdate,
    manager_user_id: int | None = None,
) -> Lab:
    """更新实验室"""
    update_dict = update_data.model_dump(exclude_unset=True)
    new_manager_id = update_dict.pop("manager_user_id", None) or manager_user_id

    for field, value in update_dict.items():
        if hasattr(lab, field):
            setattr(lab, field, value)

    if new_manager_id is not None:
        result = await db.execute(
            select(LabUser).where(LabUser.lab_id == lab.id, LabUser.is_active == 0)
        )
        existing = result.scalars().all()
        for lu in existing:
            await db.delete(lu)

        new_lab_user = LabUser(
            lab_id=lab.id,
            user_id=new_manager_id,
            created_at=datetime.now(),
            is_active=0,
        )
        db.add(new_lab_user)

    await db.commit()
    await db.refresh(lab)
    return lab


async def delete_lab(db: AsyncSession, lab: Lab) -> None:
    """删除实验室（软删除，status=3）"""
    lab.status = 3
    await db.commit()


async def get_lab_manager(
    db: AsyncSession, lab_id: int
) -> tuple[int | None, str | None, str | None]:
    """获取实验室负责人信息"""
    result = await db.execute(
        select(LabUser.user_id, User.name, User.phone)
        .join(User, User.id == LabUser.user_id)
        .where(LabUser.lab_id == lab_id, LabUser.is_active == 0)
    )
    row = result.first()
    if row:
        return row[0], row[1], row[2]
    return None, None, None
