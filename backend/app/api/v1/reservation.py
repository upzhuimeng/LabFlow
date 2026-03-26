from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import Session_Local
from app.services.reservation import *
from app.schemas.reservation import *
from app.api.deps import  get_current_user,require_role
from app.models.user import User


async def get_db():
    async with Session_Local() as session:
        yield session

router = APIRouter(prefix="/reservations", tags=["预约"])


# 查询列表（管理员）
@router.get("/")
async def get_reservations(
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(1))
):
    data = await get_reservations_service(db)
    return {"code": 200, "message": "OK", "data": data}


# 查询详情（管理员）
@router.get("/{reservation_id}")
async def get_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(1))
):
    result = await get_reservation_service(db, reservation_id)
    return {"code": 200, "message": "OK", "data": result}


# 创建预约（实验员）
@router.post("/")
async def create_reservation(
    data: ReservationCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    result = await create_reservation_service(db, data, user.id)
    return {"code": 201, "message": "Created", "data": result}


# 取消预约（实验员）
@router.patch("/{reservation_id}/cancel")
async def cancel_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    result = await cancel_reservation_service(db, reservation_id, user.id)
    return {"code": 200, "message": "OK", "data": result}


# 删除预约（管理员）
@router.delete("/{reservation_id}")
async def delete_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role(1))
):
    result = await delete_reservation_service(db, reservation_id)
    return {"code": 200, "message": "OK", "data": result}