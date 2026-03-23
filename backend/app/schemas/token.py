# -*- coding: utf-8 -*-
# File: token.py
# Created: 2026-03-23
# Author: zhuimeng
# Description: Token 数据模型

from pydantic import BaseModel, Field, model_validator
from app.exceptions.business import AuthError


class LoginRequest(BaseModel):
    phone: str = Field(..., description="手机号")
    password: str = Field(..., min_length=1, description="密码")

    @model_validator(mode="after")
    def validate_phone(self):
        phone = self.phone
        if not phone.isdigit() or len(phone) != 11:
            raise AuthError("手机号必须为11位数字")
        return self


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="访问令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
