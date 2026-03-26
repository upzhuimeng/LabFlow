from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.crud.reservation import *
from app.exceptions.business import BusinessError, NotFoundError


# 创建预约
async def create_reservation_service(db: AsyncSession, data, user_id: int):
    if data.start_time >= data.end_time:
        raise BusinessError("时间范围不合法")

    new_data = data.dict()
    new_data["user_id"] = user_id
    new_data["status"] = 0                 # 审批中
    new_data["current_level"] = 1          # 第一层审批
    new_data["is_deleted"] = 0
    new_data["created_at"] = datetime.now()

    return await create_reservation(db, new_data)


# 列表
async def get_reservations_service(db: AsyncSession):
    return await get_all_reservations(db)


# 详情
async def get_reservation_service(db: AsyncSession, reservation_id: int):
    obj = await get_reservation_by_id(db, reservation_id)
    if not obj:
        raise NotFoundError("预约不存在")
    return obj


# 取消预约（用户）
async def cancel_reservation_service(db: AsyncSession, reservation_id: int, user_id: int):
    obj = await get_reservation_by_id(db, reservation_id)
    if not obj:
        raise NotFoundError("预约不存在")

    if obj.user_id != user_id:
        raise BusinessError("只能取消自己的预约")

    if obj.status != 0:
        raise BusinessError("当前状态不可取消")

    obj.status = 3  # 已取消
    obj.updated_at = datetime.now()

    await db.commit()
    await db.refresh(obj)
    return obj


# 删除（管理员）
async def delete_reservation_service(db: AsyncSession, reservation_id: int):
    obj = await get_reservation_by_id(db, reservation_id)
    if not obj:
        raise NotFoundError("预约不存在")

    obj.is_deleted = 1
    obj.updated_at = datetime.now()

    await db.commit()
    await db.refresh(obj)
    return obj