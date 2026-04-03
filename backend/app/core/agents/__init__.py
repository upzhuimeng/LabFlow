# -*- coding: utf-8 -*-
# File: __init__.py
# Description: Agent 模块 - 导出两个独立的 Agent

from app.core.agents.reservation_agent import get_reservation_agent
from app.core.agents.statistics_agent import get_statistics_agent

__all__ = ["get_reservation_agent", "get_statistics_agent"]
