# -*- coding: utf-8 -*-
# File: agent_log.py
# Description: AgentLog CRUD operations

from datetime import datetime, timedelta
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Tuple

from app.models.agent_log import AgentLog


async def create_agent_log(
    db: AsyncSession,
    user_id: int,
    input_message: str,
    context_file: str,
) -> AgentLog:
    """创建智能体交互日志"""
    log = AgentLog(
        user_id=user_id,
        input_message=input_message,
        context_file=context_file,
        is_completed=0,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


async def get_recent_incomplete_count(
    db: AsyncSession,
    user_id: int,
    minutes: int = 10,
    limit: int = 3,
) -> Tuple[int, List[AgentLog]]:
    """获取用户最近 N 分钟内未完成的交互次数"""
    cutoff = datetime.now() - timedelta(minutes=minutes)
    query = (
        select(AgentLog)
        .where(
            and_(
                AgentLog.user_id == user_id,
                AgentLog.is_completed == 0,
                AgentLog.updated_at >= cutoff,
            )
        )
        .order_by(AgentLog.updated_at.desc())
    )
    result = await db.execute(query)
    logs = result.scalars().all()
    return len(logs), list(logs)


async def mark_as_completed(
    db: AsyncSession,
    log_id: int,
    user_id: int,
) -> bool:
    """标记交互为已完成"""
    query = select(AgentLog).where(AgentLog.id == log_id, AgentLog.user_id == user_id)
    result = await db.execute(query)
    log = result.scalar_one_or_none()
    if not log:
        return False
    log.is_completed = 1
    await db.commit()
    return True


async def mark_as_abandoned(
    db: AsyncSession,
    log_id: int,
    user_id: int,
) -> bool:
    """标记交互为已放弃"""
    query = select(AgentLog).where(AgentLog.id == log_id, AgentLog.user_id == user_id)
    result = await db.execute(query)
    log = result.scalar_one_or_none()
    if not log:
        return False
    log.is_completed = 2
    await db.commit()
    return True


async def update_context_file(
    db: AsyncSession,
    log_id: int,
    user_id: int,
    context_file: str,
) -> bool:
    """更新上下文文件路径"""
    query = select(AgentLog).where(AgentLog.id == log_id, AgentLog.user_id == user_id)
    result = await db.execute(query)
    log = result.scalar_one_or_none()
    if not log:
        return False
    log.context_file = context_file
    await db.commit()
    return True


async def get_active_log(
    db: AsyncSession,
    user_id: int,
) -> AgentLog | None:
    """获取用户最近的进行中的交互"""
    query = (
        select(AgentLog)
        .where(
            and_(
                AgentLog.user_id == user_id,
                AgentLog.is_completed == 0,
            )
        )
        .order_by(AgentLog.updated_at.desc())
        .limit(1)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()
