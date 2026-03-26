# -*- coding: utf-8 -*-
# File: tag.py
# Description: Tag CRUD 操作

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import datetime

from app.models.tag import Tag
from app.schemas.tag import TagCreate


async def get_tag_by_id(db: AsyncSession, tag_id: int) -> Optional[Tag]:
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    return result.scalar_one_or_none()


async def get_tag_by_name(db: AsyncSession, name: str) -> Optional[Tag]:
    result = await db.execute(select(Tag).where(Tag.name == name))
    return result.scalar_one_or_none()


async def get_tags(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Tag]:
    result = await db.execute(select(Tag).offset(skip).limit(limit))
    return result.scalars().all()


async def create_tag(db: AsyncSession, tag_data: TagCreate) -> Tag:
    tag = Tag(
        name=tag_data.name,
        description=tag_data.description,
        created_at=datetime.now()
    )
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag