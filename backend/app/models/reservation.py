# -*- coding: utf-8 -*-
# File: reservation.py
# Created: 2026-03-21 23:35
# Author: zhuimeng
# Description: Reservation ORM

from datetime import datetime
from sqlalchemy import SMALLINT, TEXT, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Reservation(Base):
    __tablename__ = "reservation"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="预约ID"
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=False, index=True, comment="申请人ID"
    )

    lab_id: Mapped[int] = mapped_column(
        ForeignKey("lab.id"), nullable=False, index=True, comment="实验室ID"
    )

    start_time: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, comment="开始时间"
    )

    end_time: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, comment="结束时间"
    )

    purpose: Mapped[str | None] = mapped_column(TEXT, comment="使用目的")

    status: Mapped[int] = mapped_column(
        SMALLINT, server_default="0", comment="状态(0-审批中 1-通过 2-拒绝)"
    )

    current_level: Mapped[int] = mapped_column(
        SMALLINT,
        server_default="1",
        comment="审核阶段(数字为正在审批的层级，0-保存且未提交申请 3-通过所有审批)",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False, comment="创建时间"
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=False, comment="更新时间"
    )
