# -*- coding: utf-8 -*-
# File: deps.py
# Created: 2026-03-13 01:41
# Author: zhuimeng
# Description: 依赖注入

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio.session import AsyncSession
from app.db.session import Session_Local


async def get_db() -> AsyncGenerator[AsyncSession]:
    async with Session_Local() as session:
        yield session
