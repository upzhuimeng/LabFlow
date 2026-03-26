from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.instrument import Instrument


# 创建
async def create_instrument(db: AsyncSession, data: dict):
    obj = Instrument(**data)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


# 查询全部
async def get_all_instruments(db: AsyncSession):
    result = await db.execute(select(Instrument))
    return result.scalars().all()


# 根据ID查询
async def get_instrument_by_id(db: AsyncSession, instrument_id: int):
    result = await db.execute(
        select(Instrument).where(Instrument.id == instrument_id)
    )
    return result.scalar_one_or_none()