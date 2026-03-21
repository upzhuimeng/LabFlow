# -*- coding: utf-8 -*-
# File: lab_user_log.py
# Created: 2026-03-22 01:21
# Author: zhuimeng
# Description: Lab_user_log ORM

from datetime import datetime
from sqlalchemy import SMALLINT, DateTime, Integer, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class LabUserLog(Base):
    __tablename__ = "lab_user_log"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="日志ID"
    )

    lab_user_id: Mapped[int] = mapped_column(
        Integer, nullable=False, index=True, comment="被操作记录ID"
    )

    lab_id: Mapped[int] = mapped_column(
        ForeignKey("lab.id"), nullable=False, index=True, comment="实验室ID"
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("user.id"), index=True, comment="用户ID"
    )

    operator_id: Mapped[int | None] = mapped_column(
        ForeignKey("user.id"), index=True, comment="操作人ID"
    )

    action: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="操作类型(create/update/delete)"
    )

    is_active: Mapped[int | None] = mapped_column(
        SMALLINT, comment="是否有效(0-正常 1-无效)"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, index=True, comment="操作时间"
    )
