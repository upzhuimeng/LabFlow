# -*- coding: utf-8 -*-
# File: approval.py
# Description: Approval 数据模型

from pydantic import BaseModel, Field
from datetime import datetime


class ApprovalCreate(BaseModel):
    reservation_id: int
    level: int = Field(..., ge=1, le=2, description="审批级别(1/2)")
    status: int = Field(..., ge=0, le=1, description="状态(0-通过,1-拒绝)")
    comment: str | None = Field(None, description="审批意见")


class ApprovalResponse(BaseModel):
    id: int
    reservation_id: int
    approver_id: int
    approver_name: str | None = None
    level: int
    status: int
    comment: str | None
    approved_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
