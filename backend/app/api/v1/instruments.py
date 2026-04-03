# -*- coding: utf-8 -*-
# File: instruments.py
# Description: 仪器路由

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime, timezone

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.reservation import Reservation
from app.schemas.instrument import (
    InstrumentCreate,
    InstrumentUpdate,
    InstrumentResponse,
)
from app.schemas.base import BaseResponse
from app.crud import instrument as instrument_crud
from app.crud import lab as lab_crud
from app.crud import notification as notification_crud
from app.models.lab import Lab


router = APIRouter(prefix="/api/v1/instruments", tags=["仪器管理"])


@router.post("/", status_code=201, response_model=BaseResponse)
async def create_instrument(
    instrument_data: InstrumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建仪器（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    lab = await lab_crud.get_lab_by_id(db, instrument_data.lab_id)
    if not lab:
        raise HTTPException(status_code=400, detail="实验室不存在")

    instrument = await instrument_crud.create_instrument(db, instrument_data)
    return BaseResponse(
        code=201,
        message="仪器创建成功",
        data=InstrumentResponse.model_validate(instrument).model_dump(),
    )


@router.get("/", response_model=BaseResponse)
async def list_instruments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[int] = Query(None, ge=0, le=3),
    lab_id: Optional[int] = Query(None),
    keyword: Optional[str] = Query(None, max_length=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取仪器列表"""
    skip = (page - 1) * page_size
    instruments, total = await instrument_crud.get_instruments(
        db, skip, page_size, status, lab_id, keyword
    )

    items = []
    for inst in instruments:
        item = InstrumentResponse.model_validate(inst).model_dump()
        lab_result = await db.execute(select(Lab.name).where(Lab.id == inst.lab_id))
        lab_name = lab_result.scalar_one_or_none()
        item["lab_name"] = lab_name
        items.append(item)

    return BaseResponse(
        data={
            "items": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size,
            },
        }
    )


@router.get("/{instrument_id}", response_model=BaseResponse)
async def get_instrument(
    instrument_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取仪器详情"""
    instrument = await instrument_crud.get_instrument_by_id(db, instrument_id)
    if not instrument:
        raise HTTPException(status_code=404, detail="仪器不存在")

    response_data = InstrumentResponse.model_validate(instrument).model_dump()
    lab_result = await db.execute(select(Lab.name).where(Lab.id == instrument.lab_id))
    lab_name = lab_result.scalar_one_or_none()
    response_data["lab_name"] = lab_name
    return BaseResponse(data=response_data)


@router.put("/{instrument_id}", response_model=BaseResponse)
async def update_instrument(
    instrument_id: int,
    instrument_data: InstrumentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新仪器（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    instrument = await instrument_crud.get_instrument_by_id(db, instrument_id)
    if not instrument:
        raise HTTPException(status_code=404, detail="仪器不存在")

    if instrument_data.lab_id:
        lab = await lab_crud.get_lab_by_id(db, instrument_data.lab_id)
        if not lab:
            raise HTTPException(status_code=400, detail="实验室不存在")

    old_status = instrument.status
    updated = await instrument_crud.update_instrument(db, instrument, instrument_data)

    new_status = (
        instrument_data.status if instrument_data.status is not None else old_status
    )

    if new_status == 1 and old_status != 1:
        now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
        result = await db.execute(
            select(Reservation.user_id)
            .where(
                Reservation.lab_id == instrument.lab_id,
                Reservation.is_deleted == 0,
                Reservation.status.in_([0, 1]),
                Reservation.start_time >= now_utc,
            )
            .distinct()
        )
        user_ids = [r[0] for r in result.fetchall()]

        lab_result = await db.execute(
            select(Lab.name).where(Lab.id == instrument.lab_id)
        )
        lab_name = lab_result.scalar_one_or_none() or "未知实验室"

        for user_id in user_ids:
            await notification_crud.create_notification(
                db,
                user_id=user_id,
                title="仪器维护通知",
                content=f"您预约的实验室「{lab_name}」中的仪器「{instrument.name}」正在进行维护，可能影响您的预约使用。",
                notif_type=3,
                related_id=instrument_id,
            )

    return BaseResponse(
        message="仪器更新成功",
        data=InstrumentResponse.model_validate(updated).model_dump(),
    )


@router.delete("/{instrument_id}", response_model=BaseResponse)
async def delete_instrument(
    instrument_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除仪器（管理员，软删除）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    instrument = await instrument_crud.get_instrument_by_id(db, instrument_id)
    if not instrument:
        raise HTTPException(status_code=404, detail="仪器不存在")

    await instrument_crud.delete_instrument(db, instrument)
    return BaseResponse(message="仪器删除成功")
