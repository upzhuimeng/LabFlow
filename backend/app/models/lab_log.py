# -*- coding: utf-8 -*-
# File: lab_log.py
# Created: 2026-03-22 00:20
# Author: zhuimeng
# Description: Lab_log ORM

from datetime import datetime
from sqlalchemy import SMALLINT, TEXT, DateTime, Integer, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class LabLog(Base):
    __tablename__ = "lab_log"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="日志ID"
    )

    lab_id: Mapped[int] = mapped_column(
        ForeignKey("lab.id"), nullable=False, index=True, comment="实验室ID"
    )

    operator_id: Mapped[int | None] = mapped_column(
        ForeignKey("user.id"), index=True, comment="操作人ID"
    )

    action: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="操作类型(create/update/delete)"
    )

    name: Mapped[str] = mapped_column(String(100), comment="名称")

    address: Mapped[str] = mapped_column(String(255), comment="地址")

    capacity: Mapped[int] = mapped_column(Integer, comment="容纳人数")

    status: Mapped[int] = mapped_column(SMALLINT, comment="状态(0-正常 1-维护 2-停用)")

    tag_id: Mapped[int] = mapped_column(
        ForeignKey("tag.id"), index=True, comment="标签"
    )

    keyword: Mapped[str] = mapped_column(String(255), comment="关键词")

    description: Mapped[str] = mapped_column(TEXT, comment="实验室说明")

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        index=True,
        comment="操作时间",
    )
