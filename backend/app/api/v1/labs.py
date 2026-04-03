# -*- coding: utf-8 -*-
# File: labs.py
# Description: 实验室路由

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.lab import LabCreate, LabUpdate, LabResponse
from app.schemas.base import BaseResponse
from app.crud import lab as lab_crud
from app.crud import instrument as instrument_crud
from app.crud import reservation as reservation_crud
from app.crud import user as user_crud
from app.crud import notification as notification_crud


router = APIRouter(prefix="/api/v1/labs", tags=["实验室管理"])


@router.post("/", status_code=201, response_model=BaseResponse)
async def create_lab(
    lab_data: LabCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建实验室（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    lab = await lab_crud.create_lab(db, lab_data, lab_data.manager_user_id)
    manager_id, manager_name = await lab_crud.get_lab_manager(db, lab.id)
    response_data = LabResponse.model_validate(lab).model_dump()
    response_data["manager_user_id"] = manager_id
    response_data["manager_name"] = manager_name
    return BaseResponse(
        code=201,
        message="实验室创建成功",
        data=response_data,
    )


@router.get("/", response_model=BaseResponse)
async def list_labs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[int] = Query(None, ge=0, le=2),
    keyword: Optional[str] = Query(None, max_length=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取实验室列表"""
    skip = (page - 1) * page_size
    labs, total = await lab_crud.get_labs(db, skip, page_size, status, keyword)

    items = []
    for lab in labs:
        item = LabResponse.model_validate(lab).model_dump()
        manager_id, manager_name = await lab_crud.get_lab_manager(db, lab.id)
        item["manager_user_id"] = manager_id
        item["manager_name"] = manager_name
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


@router.get("/{lab_id}", response_model=BaseResponse)
async def get_lab(
    lab_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取实验室详情"""
    lab = await lab_crud.get_lab_by_id(db, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="实验室不存在")

    manager_id, manager_name = await lab_crud.get_lab_manager(db, lab_id)
    response_data = LabResponse.model_validate(lab).model_dump()
    response_data["manager_user_id"] = manager_id
    response_data["manager_name"] = manager_name
    return BaseResponse(data=response_data)


@router.put("/{lab_id}", response_model=BaseResponse)
async def update_lab(
    lab_id: int,
    lab_data: LabUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新实验室（管理员）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    lab = await lab_crud.get_lab_by_id(db, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="实验室不存在")

    updated = await lab_crud.update_lab(db, lab, lab_data)
    manager_id, manager_name = await lab_crud.get_lab_manager(db, lab_id)
    response_data = LabResponse.model_validate(updated).model_dump()
    response_data["manager_user_id"] = manager_id
    response_data["manager_name"] = manager_name
    return BaseResponse(message="实验室更新成功", data=response_data)


@router.delete("/{lab_id}", response_model=BaseResponse)
async def delete_lab(
    lab_id: int,
    force: bool = Query(False, description="强制删除，即使有有效预约"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除实验室（管理员，软删除）"""
    if current_user.role not in [0, 1]:
        raise HTTPException(status_code=403, detail="权限不足")

    lab = await lab_crud.get_lab_by_id(db, lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail="实验室不存在")

    active_reservations = await reservation_crud.get_active_reservations_by_lab(
        db, lab_id
    )

    if active_reservations and not force:
        reservations_info = []
        for r in active_reservations[:5]:
            user = await user_crud.get_user_by_id(db, r.user_id)
            user_name = user.name if user else "未知"
            user_phone = user.phone if user else "无"
            time_str = r.start_time.strftime("%m-%d %H:%M")
            status_str = "审批中" if r.status == 0 else "已通过"
            reservations_info.append(
                f"{user_name}（{user_phone}）| {time_str} | {status_str}"
            )

        count = len(active_reservations)
        warning = f"该实验室有 {count} 个有效预约：\n"
        warning += "\n".join(reservations_info)
        if count > 5:
            warning += f"\n...还有 {count - 5} 个"
        warning += "\n\n删除后这些预约将变为无效状态。"
        raise HTTPException(status_code=400, detail=warning)

    deleted_count = await instrument_crud.soft_delete_instruments_by_lab(db, lab_id)

    invalidated_count = 0
    if active_reservations:
        invalidated_count = await reservation_crud.invalidate_reservations_by_lab(
            db, lab_id
        )
        for r in active_reservations:
            user = await user_crud.get_user_by_id(db, r.user_id)
            if user:
                await notification_crud.create_notification(
                    db,
                    user_id=user.id,
                    title="预约已失效",
                    content=f"您预约的实验室「{lab.name}」已被删除，您的预约（{r.start_time.strftime('%Y-%m-%d %H:%M')} 至 {r.end_time.strftime('%H:%M')}）已失效。",
                    notif_type=2,
                    related_id=r.id,
                )

    await lab_crud.delete_lab(db, lab)

    message = f"实验室删除成功，同时标记了 {deleted_count} 台仪器为已删除"
    if invalidated_count > 0:
        message += f"（{invalidated_count} 个预约已失效）"

    return BaseResponse(message=message)
