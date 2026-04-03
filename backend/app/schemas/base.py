# -*- coding: utf-8 -*-
# File: base.py
# Created: 2026-03-23 04:52
# Author: zhuimeng
# Description: 通用响应格式

from pydantic import BaseModel, Field


class BaseResponse(BaseModel):
    code: int = Field(default=200, description="状态码")
    message: str = Field(default="success", description="消息")
    data: dict | list | None = Field(default=None, description="数据")
