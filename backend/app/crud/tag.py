# -*- coding: utf-8 -*-
# File: tag.py
# Description: Tag CRUD 操作

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Tuple, List

from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate


async def get_tag_by_id(db: AsyncSession, tag_id: int) -> Tag | None:
    """根据ID获取标签"""
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    return result.scalar_one_or_none()


async def get_tag_by_name(db: AsyncSession, name: str) -> Tag | None:
    """根据名称获取标签"""
    result = await db.execute(select(Tag).where(Tag.name == name))
    return result.scalar_one_or_none()


async def get_tags(
    db: AsyncSession, skip: int = 0, limit: int = 100
) -> Tuple[List[Tag], int]:
    """获取标签列表"""
    query = select(Tag)

    total_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(total_query)
    total = total_result.scalar_one()

    query = query.order_by(Tag.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    tags = result.scalars().all()

    return tags, total


async def create_tag(db: AsyncSession, tag_data: TagCreate) -> Tag:
    """创建标签"""
    tag = Tag(**tag_data.model_dump())
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag


async def update_tag(db: AsyncSession, tag: Tag, update_data: TagUpdate) -> Tag:
    """更新标签"""
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if hasattr(tag, field):
            setattr(tag, field, value)
    await db.commit()
    await db.refresh(tag)
    return tag


async def delete_tag(db: AsyncSession, tag: Tag) -> None:
    """删除标签"""
    await db.delete(tag)
    await db.commit()
