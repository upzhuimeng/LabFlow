# -*- coding: utf-8 -*-
# File: user.py
# Created: 2026-03-23
# Author: zhuimeng
# Description: User 数据模型

import re
from pydantic import BaseModel, Field, model_validator
from datetime import datetime
from app.exceptions.business import RegisterError


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=30, description="用户名")
    phone: str = Field(..., description="手机号")
    password: str = Field(..., description="密码")
    email: str | None = Field(default=None, max_length=255, description="邮箱")

    @model_validator(mode="after")
    def validate_all(self):
        phone = self.phone
        if not phone.isdigit() or len(phone) != 11:
            raise RegisterError("手机号必须为11位数字")

        password = self.password
        if len(password) < 8 or len(password) > 30:
            raise RegisterError("密码长度必须为8-30位")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            raise RegisterError("密码必须包含至少一个符号")
        if not re.search(r"[a-zA-Z]", password):
            raise RegisterError("密码必须包含至少一个字母")
        if not re.search(r"\d", password):
            raise RegisterError("密码必须包含至少一个数字")

        return self


class UserUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=30, description="用户名")
    email: str | None = Field(None, max_length=255, description="邮箱")
    avatar_url: str | None = Field(None, max_length=255, description="头像URL")
    role: int | None = Field(
        None, ge=0, le=2, description="角色(0-超管,1-管理员,2-实验员)"
    )
    is_active: int | None = Field(
        None, ge=0, le=2, description="状态(0-正常,1-封禁,2-注销)"
    )


class UserResponse(BaseModel):
    id: int
    name: str
    role: int
    phone: str
    email: str | None
    avatar_url: str | None
    is_active: int
    last_login_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
