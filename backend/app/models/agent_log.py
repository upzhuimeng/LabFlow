# -*- coding: utf-8 -*-
# File: agent_log.py
# Description: 智能体交互日志模型

from datetime import datetime
from sqlalchemy import Integer, String, DateTime, SmallInteger, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class AgentLog(Base):
    __tablename__ = "agent_log"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="ID"
    )
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, comment="用户ID")
    input_message: Mapped[str] = mapped_column(
        String(500), nullable=False, comment="用户输入摘要"
    )
    context_file: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="上下文文件路径"
    )
    is_completed: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        default=0,
        comment="是否完成：0-进行中，1-已完成，2-已放弃",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), comment="创建时间"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        comment="更新时间",
    )
