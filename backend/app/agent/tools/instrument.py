# -*- coding: utf-8 -*-
# File: instrument.py
# Description: 仪器相关工具函数

from pydantic_ai import RunContext

from app.agent.schemas.deps import ReservationAssistantDeps
from app.agent.schemas.reservation_assistant import LabInfo


async def search_labs_by_instrument(
    ctx: RunContext[ReservationAssistantDeps],
    instrument_keyword: str,
) -> list[LabInfo]:
    """根据设备名称搜索实验室

    根据仪器设备名称关键词搜索拥有该设备的实验室。

    Args:
        instrument_keyword: 仪器设备名称关键词（如"磁力搅拌"、"烘箱"、"离心机"等）
    """
    from app.crud import lab as lab_crud
    from app.models.instrument import Instrument
    from sqlalchemy import select, and_

    query = (
        select(Instrument.lab_id)
        .where(
            and_(
                Instrument.name.ilike(f"%{instrument_keyword}%"),
                Instrument.status == 0,
            )
        )
        .distinct()
    )
    result = await ctx.deps.db.execute(query)
    lab_ids = [row[0] for row in result.fetchall()]

    if not lab_ids:
        return []

    labs, _ = await lab_crud.get_labs(
        ctx.deps.db,
        status=0,
    )
    labs = [lab for lab in labs if lab.id in lab_ids]

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
