# -*- coding: utf-8 -*-
# File: tag.py
# Created: 2026-03-21 01:37
# Author: zhuimeng
# Description: Tag ORM


from datetime import datetime
from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Tag(Base):
    __tablename__ = "tag"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="标签ID"
    )

    name: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, comment="标签名称"
    )

    description: Mapped[str | None] = mapped_column(String(255), comment="描述")

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, comment="创建时间"
    )
