# -*- coding: utf-8 -*-
# File: session.py
# Created: 2026-03-12 01:25
# Author: zhuimeng
# Description: 数据库连接

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import setting
from app.core.database import DatabaseSetting

db_setting: DatabaseSetting = setting.db_setting
engine: AsyncEngine = create_async_engine(db_setting.DB_URL, echo=db_setting.LOG)

Session_Local: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    expire_on_commit=db_setting.EXPIREONCOMMIT,
    autoflush=db_setting.AUTOFLUSH,
)
