# -*- coding: utf-8 -*-
# File: user_log.py
# Created: 2026-03-22 00:34
# Author: zhuimeng
# Description: User_log ORM

from datetime import datetime
from sqlalchemy import SMALLINT, DateTime, Integer, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class UserLog(Base):
    __tablename__ = "user_log"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="日志ID"
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=False, index=True, comment="用户ID"
    )

    operator_id: Mapped[int | None] = mapped_column(
        ForeignKey("user.id"), index=True, comment="操作人ID"
    )

    action: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="操作类型(create/update/delete)"
    )

    name: Mapped[str | None] = mapped_column(String(100), comment="用户名")

    password_hash: Mapped[str | None] = mapped_column(String(255), comment="密码哈希")

    role: Mapped[int | None] = mapped_column(SMALLINT, comment="角色(保留字段)")

    phone: Mapped[str | None] = mapped_column(String(20), comment="手机号")

    email: Mapped[str | None] = mapped_column(String(100), comment="邮箱")

    avatar_url: Mapped[str | None] = mapped_column(String(255), comment="头像")

    is_active: Mapped[int | None] = mapped_column(
        SMALLINT, comment="是否启用(0-正常 1-封禁 2-注销)"
    )

    create_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, index=True, comment="操作时间"
    )
