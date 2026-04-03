# -*- coding: utf-8 -*-
# File: agents.py
# Description: Agent 配置

import os
from functools import lru_cache

from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from app.agent.schemas.deps import ReservationAssistantDeps
from app.agent.schemas.reservation_assistant import (
    ReservationSuggestion,
    TimeSlot,
)
from app.agent.tools import (
    search_labs,
    get_lab_details,
    check_availability,
    get_user_reservations,
)
from .validators import Validator


class AgentSetting:
    def __init__(self):
        self.AGENT_MODEL_NAME: str = Validator.str_validator(
            "AGENT_MODEL_NAME", os.getenv("AGENT_MODEL_NAME", "MiniMax-M2.7")
        )
        self.AGENT_API: str = Validator.str_validator(
            "AGENT_API", os.getenv("AGENT_API", "https://api.minimaxi.com/v1")
        )
        self.AGENT_API_KEY: str = Validator.str_validator(
            "AGENT_API_KEY", os.getenv("AGENT_API_KEY", "")
        )

    def create_model(self) -> OpenAIChatModel:
        """创建 OpenAI 兼容模型"""
        os.environ["OPENAI_API_KEY"] = self.AGENT_API_KEY
        os.environ["OPENAI_BASE_URL"] = self.AGENT_API

        return OpenAIChatModel(
            model_name=self.AGENT_MODEL_NAME,
            provider="openai-chat",
        )


@lru_cache
def get_agent_setting() -> AgentSetting:
    """获取 Agent 配置（单例）"""
    return AgentSetting()


def create_reservation_agent() -> Agent[ReservationAssistantDeps, str]:
    """创建预约助手 Agent"""
    setting = get_agent_setting()

    return Agent(
        model=setting.create_model(),
        deps_type=ReservationAssistantDeps,
        output_type=str,
        system_prompt="""
你是 LabFlow 智能预约助手，帮助用户快速找到合适的实验室和时间段进行预约。

工作流程：
1. 理解用户的实验需求（实验类型、所需设备、时间要求）
2. 如果用户提到关键词（如"化学"、"物理"、"生物"等），使用 search_labs 搜索符合条件的实验室
3. 检查用户指定的时间段是否可用（使用 check_availability）
4. 如果首选时间不可用，提供替代时间段
5. 推荐最佳方案

可用工具：
- search_labs: 搜索实验室（支持关键词搜索）
- get_lab_details: 获取实验室详细信息
- check_availability: 检查指定时间段是否可用（参数：lab_id, date格式YYYY-MM-DD, start_hour, end_hour）
- get_user_reservations: 获取当前用户的已有预约

注意事项：
- 只推荐状态正常的实验室（status=0）
- 必须返回 JSON 格式结果！在最后用 ```json 代码块包裹
- 无论是否找到实验室，都必须返回 JSON，格式如下：
{"lab_id": 1, "lab_name": "化学实验室 A", "start_time": "2026-04-04T14:00:00", "end_time": "2026-04-04T17:00:00", "reason": "推荐理由", "address": "实验楼1层101"}
{"lab_id": null}  // 如果没有找到合适的实验室
- 如果用户没有指定具体时间，使用当天的 09:00-12:00 作为默认时间
- 如果用户只提到日期没提到具体时间，假设是当天的 09:00-12:00
- 保持回复简洁，突出关键信息
- 始终使用中文回复用户
""",
        tools=[
            search_labs,
            get_lab_details,
            check_availability,
            get_user_reservations,
        ],
    )


reservation_agent: Agent[ReservationAssistantDeps, str] | None = None


def get_reservation_agent() -> Agent[ReservationAssistantDeps, str]:
    """获取预约助手 Agent（单例）"""
    global reservation_agent
    if reservation_agent is None:
        reservation_agent = create_reservation_agent()
    return reservation_agent
