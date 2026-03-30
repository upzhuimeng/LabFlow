# -*- coding: utf-8 -*-
# File: token.py
# Created: 2026-03-23
# Author: zhuimeng
# Description: Token 数据模型

from pydantic import BaseModel, Field, model_validator
from app.exceptions.business import AuthError


class LoginRequest(BaseModel):
    phone: str | None = Field(None, description="手机号")
    email: str | None = Field(None, description="邮箱")
    password: str = Field(..., min_length=1, description="密码")

    @model_validator(mode="after")
    def validate_login_param(self):
        if not self.phone and not self.email:
            raise AuthError("请提供手机号或邮箱")
        if self.phone and (not self.phone.isdigit() or len(self.phone) != 11):
            raise AuthError("手机号必须为11位数字")
        if self.email and "@" not in self.email:
            raise AuthError("邮箱格式不正确")
        return self


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="访问令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
