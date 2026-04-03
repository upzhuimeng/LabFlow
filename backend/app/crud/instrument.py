# -*- coding: utf-8 -*-
# File: instrument.py
# Description: Instrument CRUD 操作

from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Tuple, List

from app.models.instrument import Instrument
from app.schemas.instrument import InstrumentCreate, InstrumentUpdate


async def get_instrument_by_id(
    db: AsyncSession, instrument_id: int
) -> Instrument | None:
    """根据ID获取仪器"""
    result = await db.execute(select(Instrument).where(Instrument.id == instrument_id))
    return result.scalar_one_or_none()


async def get_instruments(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    status: int | None = None,
    lab_id: int | None = None,
    keyword: str | None = None,
) -> Tuple[List[Instrument], int]:
    """获取仪器列表"""
    query = select(Instrument)

    if status is not None:
        query = query.where(Instrument.status == status)

    if lab_id is not None:
        query = query.where(Instrument.lab_id == lab_id)

    if keyword and keyword.strip():
        query = query.where(Instrument.name.ilike(f"%{keyword}%"))

    total_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(total_query)
    total = total_result.scalar_one()

    query = query.order_by(Instrument.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    instruments = result.scalars().all()

    return instruments, total


async def create_instrument(
    db: AsyncSession, instrument_data: InstrumentCreate
) -> Instrument:
    """创建仪器"""
    instrument_dict = instrument_data.model_dump()
    instrument = Instrument(
        **instrument_dict,
        created_at=datetime.now(),
    )
    db.add(instrument)
    await db.commit()
    await db.refresh(instrument)
    return instrument


async def update_instrument(
    db: AsyncSession, instrument: Instrument, update_data: InstrumentUpdate
) -> Instrument:
    """更新仪器"""
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if hasattr(instrument, field):
            setattr(instrument, field, value)
    await db.commit()
    await db.refresh(instrument)
    return instrument


async def delete_instrument(db: AsyncSession, instrument: Instrument) -> None:
    """删除仪器（软删除，status=2）"""
    instrument.status = 2
    await db.commit()
