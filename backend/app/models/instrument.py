# -*- coding: utf-8 -*-
# File: instrument.py
# Created: 2026-03-20 01:18
# Author: zhuimeng
# Description: Instrument ORM

from sqlalchemy import (
    Integer,
    SmallInteger,
    String,
    Numeric,
    DateTime,
    ForeignKey,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column
from decimal import Decimal
from datetime import datetime
from app.db.base import Base


class Instrument(Base):
    __tablename__ = "instrument"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="仪器ID"
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False, comment="仪器名称")

    model: Mapped[str] = mapped_column(String(100), nullable=False, comment="仪器型号")

    manufacturer: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="厂商"
    )

    supplier: Mapped[str] = mapped_column(String(255), nullable=False, comment="供应商")

    purchase_date: Mapped[datetime | None] = mapped_column(DateTime, comment="采购时间")

    price: Mapped[Decimal] = mapped_column(
        Numeric(precision=10, scale=2), nullable=False, comment="购入价格"
    )

    status: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        server_default="0",
        comment="状态，0-正常 1-维修 2-停用",
    )

    lab_id: Mapped[int] = mapped_column(
        ForeignKey("lab.id"), index=True, nullable=False, comment="所属实验室"
    )

    remark: Mapped[str | None] = mapped_column(String(255), comment="备注")

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), comment="创建时间"
    )

    updated_at: Mapped[datetime | None] = mapped_column(DateTime, comment="更新时间")
