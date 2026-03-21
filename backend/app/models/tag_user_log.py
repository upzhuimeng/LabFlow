# -*- coding: utf-8 -*-
# File: tag_user_log.py
# Created: 2026-03-22 01:30
# Author: zhuimeng
# Description: Tag_user_log ORM

from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class TagUserLog(Base):
    __tablename__ = "tag_user_log"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="日志ID"
    )

    tag_user_id: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="被操作的记录ID"
    )

    tag_id: Mapped[int | None] = mapped_column(ForeignKey("tag.id"), comment="标签ID")

    user_id: Mapped[int | None] = mapped_column(ForeignKey("user.id"), comment="用户ID")

    operator_id: Mapped[int | None] = mapped_column(
        ForeignKey("user.id"), comment="操作人ID"
    )

    action: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="操作类型(create/update/delete)"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, comment="操作时间"
    )
