from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.crud.instrument import *
from app.exceptions.business import BusinessError, NotFoundError

# 创建
async def create_instrument_service(db: AsyncSession, data):
    new_data = data.dict()
    new_data["created_at"] = datetime.now()
    new_data["status"] = 0
    return await create_instrument(db, new_data)

# 列表
async def get_instruments_service(db: AsyncSession):
    return await get_all_instruments(db)

# 详情
async def get_instrument_service(db: AsyncSession, instrument_id: int):
    instrument = await get_instrument_by_id(db, instrument_id)
    if not instrument:
        raise NotFoundError("仪器不存在")
    return instrument

# 更新
async def update_instrument_service(db: AsyncSession, instrument_id: int, data):
    instrument = await get_instrument_by_id(db, instrument_id)
    if not instrument:
        raise NotFoundError("仪器不存在")
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(instrument, key, value)
    instrument.updated_at = datetime.now()
    await db.commit()
    await db.refresh(instrument)
    return instrument


# 修改状态
async def update_status_service(db: AsyncSession, instrument_id: int, status: int):
    instrument = await get_instrument_by_id(db, instrument_id)
    if not instrument:
        raise NotFoundError("仪器不存在")
    if status not in [0, 1, 2]:
        raise BusinessError("非法状态值")
    instrument.status = status
    instrument.updated_at = datetime.now()
    await db.commit()
    await db.refresh(instrument)
    return instrument


# 移用申请
async def transfer_instrument_service(db: AsyncSession, instrument_id: int):
    instrument = await get_instrument_by_id(db, instrument_id)
    if not instrument:
        raise NotFoundError("仪器不存在")
    if instrument.status != 0:
        raise BusinessError("仪器不可用")
    return {
        "instrument_id": instrument_id,
        "status": "pending"
    }
