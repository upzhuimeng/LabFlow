# -*- coding: utf-8 -*-
# File: instrument.py
# Description: Instrument 数据模型

from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal


class InstrumentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="仪器名称")
    model: str = Field(..., min_length=1, max_length=100, description="型号")
    manufacturer: str = Field(..., min_length=1, max_length=255, description="厂商")
    supplier: str = Field(..., min_length=1, max_length=255, description="供应商")
    purchase_date: datetime | None = Field(None, description="采购日期")
    price: Decimal = Field(..., ge=0, description="价格")
    lab_id: int = Field(..., description="所属实验室ID")
    remark: str | None = Field(None, max_length=255, description="备注")


class InstrumentUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100, description="仪器名称")
    model: str | None = Field(None, min_length=1, max_length=100, description="型号")
    manufacturer: str | None = Field(
        None, min_length=1, max_length=255, description="厂商"
    )
    supplier: str | None = Field(
        None, min_length=1, max_length=255, description="供应商"
    )
    purchase_date: datetime | None = Field(None, description="采购日期")
    price: Decimal | None = Field(None, ge=0, description="价格")
    status: int | None = Field(
        None, ge=0, le=2, description="状态(0-正常,1-维修,2-停用)"
    )
    lab_id: int | None = Field(None, description="所属实验室ID")
    remark: str | None = Field(None, max_length=255, description="备注")


class InstrumentResponse(BaseModel):
    id: int
    name: str
    model: str
    manufacturer: str
    supplier: str
    purchase_date: datetime | None
    price: Decimal
    status: int
    lab_id: int
    remark: str | None
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}
