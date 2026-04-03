# -*- coding: utf-8 -*-
# File: deps.py
# Description: Agent 依赖类型定义

from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession


@dataclass
class AgentDeps:
    """Agent 基础依赖"""

    user_id: int
    db: AsyncSession
    user_name: str | None = None


@dataclass
class ReservationAssistantDeps(AgentDeps):
    """预约助手依赖"""

    pass
