from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.lab import Lab

#创建
async def create_lab(db: AsyncSession, data: dict):
    obj = Lab(**data)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj

#查询全部
async def get_all_labs(db: AsyncSession):
    result = await db.execute(select(Lab))
    return result.scalars().all()

#根据id查询
async def get_lab_by_id(db: AsyncSession, lab_id: int):
    result = await db.execute(
        select(Lab).where(Lab.id == lab_id)
    )
    return result.scalar_one_or_none()

#更新
async def update_lab(db: AsyncSession, obj, data: dict):
    for key, value in data.items():
        setattr(obj, key, value)
    await db.commit()
    await db.refresh(obj)
    return obj