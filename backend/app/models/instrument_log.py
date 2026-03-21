# -*- coding: utf-8 -*-
# File: instrument_log.py
# Created: 2026-03-22 00:04
# Author: zhuimeng
# Description: Instrument_log ORM

from datetime import datetime
from decimal import Decimal
from sqlalchemy import DECIMAL, SMALLINT, DateTime, Integer, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class InstrumentLog(Base):
    __tablename__ = "instrument_log"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="ID"
    )

    instrument_id: Mapped[int] = mapped_column(
        ForeignKey("instrument.id"), nullable=False, index=True, comment="仪器ID"
    )

    operator_id: Mapped[int | None] = mapped_column(
        ForeignKey("user.id"), index=True, comment="操作人ID"
    )

    action: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="操作类型(create/update/delete)"
    )

    name: Mapped[str | None] = mapped_column(String(100), comment="仪器名称")

    model: Mapped[str | None] = mapped_column(String(100), comment="型号")

    manufacturer: Mapped[str | None] = mapped_column(String(255), comment="厂商")

    supplier: Mapped[str | None] = mapped_column(String(255), comment="提供商名称")

    purchase_date: Mapped[datetime | None] = mapped_column(DateTime, comment="采购日期")

    price: Mapped[Decimal | None] = mapped_column(
        DECIMAL(precision=10, scale=2), comment="仪器价格"
    )

    status: Mapped[int] = mapped_column(SMALLINT, comment="状态(0-正常 1-维护 2-停用)")

    lab_id: Mapped[int] = mapped_column(ForeignKey("lab.id"), comment="所属实验室")

    remark: Mapped[str | None] = mapped_column(String(255), comment="备注")

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        index=True,
        nullable=False,
        server_default=func.now(),
        comment="操作时间",
    )
