from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import Session_Local
from app.services.instrument import *
from app.schemas.instrument import *
from app.api.deps import  require_role


async def get_db():
    async with Session_Local() as session:
        yield session



router = APIRouter(prefix="/instruments", tags=["仪器"])


# 列表（实验员及以上）
@router.get("/")
async def get_instruments(
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(2))
):
    data = await get_instruments_service(db)
    return {"code": 200, "message": "OK", "data": data}


# 详情
@router.get("/{instrument_id}")
async def get_instrument(
    instrument_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(2))
):
    result = await get_instrument_service(db, instrument_id)
    return {"code": 200, "message": "OK", "data": result}


# 创建（管理员）
@router.post("/")
async def create_instrument(
    data: InstrumentCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(1))
):
    result = await create_instrument_service(db, data)
    return {"code": 201, "message": "Created", "data": result}


# 修改（管理员）
@router.put("/{instrument_id}")
async def update_instrument(
    instrument_id: int,
    data: InstrumentUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(1))
):
    result = await update_instrument_service(db, instrument_id, data)
    return {"code": 200, "message": "OK", "data": result}


# 修改状态（管理员）
@router.patch("/{instrument_id}")
async def update_status(
    instrument_id: int,
    data: InstrumentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(1))
):
    result = await update_status_service(db, instrument_id, data.status)
    return {"code": 200, "message": "OK", "data": result}


# 移用申请（实验员）
@router.post("/{instrument_id}/transfer")
async def transfer(
    instrument_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(2))
):
    result = await transfer_instrument_service(db, instrument_id)
    return {"code": 201, "message": "Created", "data": result}