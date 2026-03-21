# -*- coding: utf-8 -*-
# File: approval.py
# Created: 2026-03-21 23:49
# Author: zhuimeng
# Description: Approval ORM

from datetime import datetime
from sqlalchemy import SMALLINT, TEXT, DateTime, Integer, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Approval(Base):
    __tablename__ = "approval"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="ID"
    )

    reservation_id: Mapped[int] = mapped_column(
        ForeignKey("reservation.id"), nullable=False, index=True, comment="预约ID"
    )

    approver_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=False, index=True, comment="审批人ID"
    )

    level: Mapped[int] = mapped_column(
        SMALLINT, nullable=False, comment="审批等级(1/2)"
    )

    status: Mapped[int] = mapped_column(
        SMALLINT, nullable=False, server_default="0", comment="状态(0-通过 1-拒绝)"
    )

    comment: Mapped[str] = mapped_column(TEXT, comment="审批意见")

    approved_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, comment="审批时间"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), comment="创建时间"
    )
