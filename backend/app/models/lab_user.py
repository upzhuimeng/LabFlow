# -*- coding: utf-8 -*-
# File: lab_user.py
# Created: 2026-03-21 01:42
# Author: zhuimeng
# Description: Lab_User ORM

from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, SmallInteger, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class LabUser(Base):
    __tablename__ = "lab_user"
    __table_args__ = (UniqueConstraint("lab_id", "user_id", name="lab_user_unique"),)

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="ID"
    )

    lab_id: Mapped[int] = mapped_column(
        ForeignKey("lab.id"), nullable=False, comment="实验室ID"
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=False, comment="用户ID"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, comment="创建时间"
    )

    is_active: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        server_default="0",
        comment="是否有效(0-有效 1-无效)",
    )
