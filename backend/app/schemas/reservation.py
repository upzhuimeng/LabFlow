# -*- coding: utf-8 -*-
# File: reservation.py
# Description: 预约相关的数据模型

from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime


class ReservationBase(BaseModel):
    """预约基础模型"""

    lab_id: int = Field(..., description="实验室ID")
    start_time: datetime = Field(..., description="开始时间")
    end_time: datetime = Field(..., description="结束时间")
    purpose: str | None = Field(None, description="使用目的")

    @field_validator("start_time", "end_time", mode="before")
    @classmethod
    def parse_datetime(cls, value):
        """处理带 Z 的时间格式"""
        if isinstance(value, str) and value.endswith("Z"):
            value = value.replace("Z", "+00:00")
        return value


class ReservationCreate(ReservationBase):
    """创建预约"""

    pass


class ReservationUpdate(BaseModel):
    """更新预约（修改内容）"""

    start_time: datetime | None = None
    end_time: datetime | None = None
    purpose: str | None = None

    @field_validator("start_time", "end_time", mode="before")
    @classmethod
    def parse_datetime(cls, value):
        if isinstance(value, str) and value.endswith("Z"):
            value = value.replace("Z", "+00:00")
        return value


class ReservationReapply(BaseModel):
    """重新申请（被拒绝后重新提交）"""

    start_time: datetime
    end_time: datetime
    purpose: str | None = None

    @field_validator("start_time", "end_time", mode="before")
    @classmethod
    def parse_datetime(cls, value):
        if isinstance(value, str) and value.endswith("Z"):
            value = value.replace("Z", "+00:00")
        return value


class ReservationResponse(ReservationBase):
    """预约响应模型"""

    id: int
    user_id: int
    user_name: str | None = None
    lab_name: str | None = None
    status: int = Field(0, description="状态：0-审批中 1-通过 2-拒绝 3-已取消 4-草稿")
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
