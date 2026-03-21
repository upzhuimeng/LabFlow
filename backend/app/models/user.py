# -*- coding: utf-8 -*-
# File: user.py
# Created: 2026-03-13 08:04
# Author: zhuimeng
# Description: User ORM

from sqlalchemy import Integer, String, DateTime, SmallInteger, func
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.base import Base


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="用户ID"
    )

    name: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True, comment="用户名"
    )

    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="密码"
    )

    role: Mapped[int] = mapped_column(
        SmallInteger,
        server_default="2",
        comment="角色（0-超级管理员 1-管理员 2-实验员）",
    )

    phone: Mapped[str] = mapped_column(
        String(20), nullable=False, unique=True, comment="电话号码"
    )

    email: Mapped[str | None] = mapped_column(
        String(255), unique=True, index=True, comment="邮箱"
    )

    avatar_url: Mapped[str | None] = mapped_column(String(255), comment="头像")

    is_active: Mapped[int] = mapped_column(
        SmallInteger, server_default="0", comment="是否启用，0-启用，1-封禁，2-注销"
    )

    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime, comment="最后登录时间"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), comment="创建时间"
    )

    updated_at: Mapped[datetime | None] = mapped_column(DateTime, comment="更新时间")
