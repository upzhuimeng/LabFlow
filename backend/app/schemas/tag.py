# -*- coding: utf-8 -*-
# File: tag.py
# Description: Tag 数据模型

from pydantic import BaseModel, Field
from datetime import datetime


class TagCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="标签名称")
    description: str | None = Field(None, max_length=255, description="描述")


class TagUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=50, description="标签名称")
    description: str | None = Field(None, max_length=255, description="描述")


class TagResponse(BaseModel):
    id: int
    name: str
    description: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
