# -*- coding: utf-8 -*-
# File: tags.py
# Description: 标签业务逻辑


from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from app.crud import tag as tag_crud
from app.schemas.tag import TagCreate
async def create_tag(db: AsyncSession, tag_data: TagCreate) -> Dict[str, Any]:
    """创建标签"""
    # 检查标签名称是否已存在
    existing = await tag_crud.get_tag_by_name(db, tag_data.name)
    if existing:
        raise ValueError(f"标签「{tag_data.name}」已存在")

    # 创建标签
    tag = await tag_crud.create_tag(db, tag_data)

    return {
        "id": tag.id,
        "name": tag.name,
        "description": tag.description,
        "created_at": tag.created_at
    }

async def get_tags(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """获取标签列表"""
    tags = await tag_crud.get_tags(db, skip, limit)
    return [
        {
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "created_at": t.created_at
        }
        for t in tags
    ]