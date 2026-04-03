# -*- coding: utf-8 -*-
# File: notification.py
# Description: 通知模型

from datetime import datetime
from sqlalchemy import Integer, String, Text, SmallInteger, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Notification(Base):
    __tablename__ = "notification"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="ID"
    )
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, comment="接收用户ID")
    title: Mapped[str] = mapped_column(String(100), nullable=False, comment="标题")
    content: Mapped[str] = mapped_column(Text, nullable=False, comment="内容")
    type: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        default=3,
        comment="类型：1-审批结果，2-预约失效，3-系统通知，4-智能推荐，5-AI总结",
    )
    related_id: Mapped[int | None] = mapped_column(
        Integer, nullable=True, comment="关联ID"
    )
    attachment: Mapped[str | None] = mapped_column(
        Text, nullable=True, comment="附件JSON数据（智能推荐等）"
    )
    is_read: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        default=0,
        comment="状态：0-未读，1-已读，2-已删除",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), comment="创建时间"
    )
