# -*- coding: utf-8 -*-
# File: tag_log.py
# Created: 2026-03-22 01:14
# Author: zhuimeng
# Description: Tag_log ORM

from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class TagLog(Base):
    __tablename__ = "tag_log"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="日志ID"
    )

    tag_id: Mapped[int] = mapped_column(
        ForeignKey("tag.id"), nullable=False, index=True, comment="标签ID"
    )

    operator_id: Mapped[int | None] = mapped_column(
        ForeignKey("user.id"), index=True, comment="操作人ID"
    )

    action: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="操作类型(create/update/delete)"
    )

    name: Mapped[str] = mapped_column(String(50), comment="标签名")

    description: Mapped[str] = mapped_column(String(255), comment="描述")

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, index=True, comment="操作时间"
    )
