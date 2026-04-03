# -*- coding: utf-8 -*-
# File: lab.py
# Description: 实验室相关工具函数

from pydantic_ai import RunContext

from app.agent.schemas.deps import ReservationAssistantDeps
from app.agent.schemas.reservation_assistant import LabInfo, LabDetail


async def search_labs(
    ctx: RunContext[ReservationAssistantDeps],
    keyword: str | None = None,
) -> list[LabInfo]:
    """搜索实验室

    根据关键词搜索实验室，返回状态正常的实验室列表。

    Args:
        keyword: 搜索关键词（如"化学"、"物理"、"生物"等）
    """
    from app.crud import lab as lab_crud

    labs, _ = await lab_crud.get_labs(
        ctx.deps.db,
        status=0,
        keyword=keyword,
    )

    return [
        LabInfo(
            id=lab.id,
            name=lab.name,
            address=lab.address,
            capacity=lab.capacity,
            description=lab.description,
        )
        for lab in labs
    ]


async def get_lab_details(
    ctx: RunContext[ReservationAssistantDeps],
    lab_id: int,
) -> LabDetail | None:
    """获取实验室详细信息

    Args:
        lab_id: 实验室ID
    """
    from app.crud import lab as lab_crud

    lab = await lab_crud.get_lab_by_id(ctx.deps.db, lab_id)
    if not lab or lab.status != 0:
        return None

    manager_id, manager_name, manager_phone = await lab_crud.get_lab_manager(
        ctx.deps.db, lab_id
    )

    return LabDetail(
        id=lab.id,
        name=lab.name,
        address=lab.address,
        capacity=lab.capacity,
        description=lab.description,
        manager=manager_name,
    )
