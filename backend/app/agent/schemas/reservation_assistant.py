# -*- coding: utf-8 -*-
# File: reservation_assistant.py
# Description: 预约助手相关的 Pydantic 模型

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Any


class TimeSlot(BaseModel):
    """时间段"""

    start: datetime = Field(description="开始时间")
    end: datetime = Field(description="结束时间")


class LabInfo(BaseModel):
    """实验室基本信息"""

    id: int = Field(description="实验室ID")
    name: str = Field(description="实验室名称")
    address: str = Field(description="实验室地址")
    capacity: int | None = Field(default=None, description="容纳人数")
    description: str | None = Field(default=None, description="实验室描述")


class LabDetail(LabInfo):
    """实验室详细信息"""

    manager: str | None = Field(default=None, description="实验室负责人")


class ReservationSuggestion(BaseModel):
    """预约建议"""

    lab_id: int = Field(description="推荐的实验室ID")
    lab_name: str = Field(description="实验室名称")
    address: str = Field(description="实验室地址")
    start_time: datetime = Field(description="推荐开始时间")
    end_time: datetime = Field(description="推荐结束时间")
    reason: str = Field(description="推荐理由")
    equipment: list[str] = Field(default=[], description="可用设备")


class AvailabilityResult(BaseModel):
    """可用性检查结果"""

    available: bool = Field(description="是否可用")
    reason: str = Field(default="", description="原因")
    conflicts: list[dict[str, Any]] = Field(default=[], description="冲突的时间段")


class ReservationAssistantResult(BaseModel):
    """预约助手返回结果"""

    success: bool = Field(description="是否成功找到推荐")
    suggestion: ReservationSuggestion | None = Field(
        default=None, description="推荐结果"
    )
    message: str = Field(description="返回消息")
    available_slots: list[TimeSlot] = Field(default=[], description="其他可用时间段")


class AgentOutput(BaseModel):
    """智能助手输出格式（固定格式）"""

    lab_id: int | None = Field(description="推荐的实验室ID，找不到时为null")
    lab_name: str | None = Field(description="实验室名称")
    address: str | None = Field(description="实验室地址")
    start_time: str | None = Field(
        description="推荐开始时间，格式YYYY-MM-DDTHH:MM:SS，找不到时为null"
    )
    end_time: str | None = Field(
        description="推荐结束时间，格式YYYY-MM-DDTHH:MM:SS，找不到时为null"
    )
    reason: str = Field(description="推荐理由或未找到原因")
    purpose: str | None = Field(description="预约用途说明，找不到时为null")


class UserIntent(BaseModel):
    """用户预约意图解析结果"""

    keyword: str | None = Field(
        description="实验室类型关键词，如化学、物理、生物等", default=None
    )
    equipment: str | None = Field(
        description="所需仪器设备，如烘箱、离心机等", default=None
    )
    date: str | None = Field(
        description="预约日期，如2026-04-08或today/tomorrow", default=None
    )
    start_hour: int | None = Field(
        description="开始小时，24小时制，如14表示下午2点", default=None
    )
    end_hour: int | None = Field(
        description="结束小时，24小时制，如17表示下午5点", default=None
    )
    purpose: str | None = Field(description="预约用途/实验内容", default=None)
