# -*- coding: utf-8 -*-
# File: tag_user.py
# Created: 2026-03-21 23:24
# Author: zhuimeng
# Description: Tag User ORM


from datetime import datetime
from sqlalchemy import DateTime, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class TagUser(Base):
    __tablename__ = "tag_user"
    __table_args__ = (
        UniqueConstraint("tag_id", "user_id", name="tag_id_user_id_unique"),
    )
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="ID"
    )

    tag_id: Mapped[int] = mapped_column(
        ForeignKey("tag.id"), nullable=False, comment="标签ID"
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=False, comment="用户ID"
    )

    create_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, comment="创建时间"
    )
