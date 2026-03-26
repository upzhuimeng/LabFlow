from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.crud.lab import *
from app.exceptions.business import BusinessError, NotFoundError


# 创建
async def create_lab_service(db: AsyncSession, data):
    new_data = data.dict()
    new_data["created_at"] = datetime.now()
    new_data["status"] = 0
    return await create_lab(db, new_data)

# 列表
async def get_labs_service(db: AsyncSession):
    return await get_all_labs(db)

# 详情
async def get_lab_service(db: AsyncSession, lab_id: int):
    lab = await get_lab_by_id(db, lab_id)
    if not lab:
        raise NotFoundError("实验室不存在")
    return lab


# 更新
async def update_lab_service(db: AsyncSession, lab_id: int, data):
    lab = await get_lab_by_id(db, lab_id)
    if not lab:
        raise NotFoundError("实验室不存在")
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lab, key, value)
    lab.updated_at = datetime.now()
    await db.commit()
    await db.refresh(lab)
    return lab


# 修改状态
async def update_lab_status_service(db: AsyncSession, lab_id: int, status: int):
    lab = await get_lab_by_id(db, lab_id)
    if not lab:
        raise NotFoundError("实验室不存在")
    if status not in [0, 1, 2]:
        raise BusinessError("非法状态值")
    lab.status = status
    lab.updated_at = datetime.now()
    await db.commit()
    await db.refresh(lab)
    return lab


#使用申请
async def apply_lab_service(db: AsyncSession, lab_id: int):
    lab = await get_lab_by_id(db, lab_id)
    if not lab:
        raise NotFoundError("实验室不存在")
    if lab.status != 0:
        raise BusinessError("实验室不可用")
    return {
        "lab_id": lab_id,
        "status": "pending"
    }