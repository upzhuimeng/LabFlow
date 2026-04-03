# -*- coding: utf-8 -*-
# File: lab.py
# Description: Lab 数据模型

from pydantic import BaseModel, Field
from datetime import datetime


class LabCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="实验室名称")
    address: str = Field(..., min_length=1, max_length=255, description="地址")
    capacity: int | None = Field(None, ge=1, description="容纳人数")
    keyword: str | None = Field(None, max_length=255, description="关键词")
    description: str | None = Field(None, description="实验室说明")
    manager_user_id: int = Field(..., description="负责人用户ID")


class LabUpdate(BaseModel):
    name: str | None = Field(
        None, min_length=1, max_length=100, description="实验室名称"
    )
    address: str | None = Field(None, min_length=1, max_length=255, description="地址")
    capacity: int | None = Field(None, ge=1, description="容纳人数")
    status: int | None = Field(
        None, ge=0, le=2, description="状态(0-正常,1-维护,2-停用)"
    )
    keyword: str | None = Field(None, max_length=255, description="关键词")
    description: str | None = Field(None, description="实验室说明")
    manager_user_id: int | None = Field(None, description="负责人用户ID")


class LabResponse(BaseModel):
    id: int
    name: str
    address: str
    capacity: int | None
    status: int
    keyword: str | None
    description: str | None
    manager_user_id: int | None = None
    manager_name: str | None = None
    manager_phone: str | None = None
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}
