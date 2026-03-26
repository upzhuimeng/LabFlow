from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.reservation import Reservation


# 创建
async def create_reservation(db: AsyncSession, data: dict):
    obj = Reservation(**data)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


# 查询全部
async def get_all_reservations(db: AsyncSession):
    result = await db.execute(
        select(Reservation).where(Reservation.is_deleted == 0)
    )
    return result.scalars().all()


# 根据ID
async def get_reservation_by_id(db: AsyncSession, reservation_id: int):
    result = await db.execute(
        select(Reservation).where(
            Reservation.id == reservation_id,
            Reservation.is_deleted == 0
        )
    )
    return result.scalar_one_or_none()