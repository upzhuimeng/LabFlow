# -*- coding: utf-8 -*-
# File: lab.py
# Created: 2026-03-21 01:04
# Author: zhuimeng
# Description: Lab ORM

from datetime import datetime
from sqlalchemy import DateTime, Integer, SmallInteger, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Lab(Base):
    __tablename__ = "lab"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="实验室ID"
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False, comment="名称")

    address: Mapped[str] = mapped_column(String(255), nullable=False, comment="地址")

    capacity: Mapped[int | None] = mapped_column(
        Integer, comment="容纳人数（NULL-未设置）"
    )

    status: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        server_default="0",
        comment="状态(0-正常 1-维护 2-停用)",
    )

    keyword: Mapped[str | None] = mapped_column(
        String(255), comment="关键词，用于大模型检索"
    )

    description: Mapped[str | None] = mapped_column(Text, comment="实验室说明")

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), comment="创建时间"
    )

    updated_at: Mapped[datetime | None] = mapped_column(DateTime, comment="更新时间")
