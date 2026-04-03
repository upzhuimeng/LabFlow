# -*- coding: utf-8 -*-
# File: token.py
# Created: 2026-03-23
# Author: zhuimeng
# Description: Token 数据模型

from pydantic import BaseModel, Field, SecretStr


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="手机号、邮箱或用户名")
    password: SecretStr = Field(..., description="密码")


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="访问令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
