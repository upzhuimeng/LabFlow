# -*- coding: utf-8 -*-
# File: tag.py
# Description: Tag 数据模型

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class TagBase(BaseModel):
    name: str = Field(..., max_length=50, description="标签名称")
    description: Optional[str] = Field(None, max_length=255, description="描述")


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)