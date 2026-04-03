# -*- coding: utf-8 -*-
# File: reservation_agent.py
# Description: 预约助手 Agent

from functools import lru_cache
import os

from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel

from app.agent.schemas.deps import ReservationAssistantDeps
from app.agent.schemas.reservation_assistant import AgentOutput
from app.agent.tools import (
    search_labs,
    check_availability,
    search_labs_by_instrument,
)
from app.core.validators import Validator


class ReservationAgentSetting:
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
        os.environ["OPENAI_API_KEY"] = self.AGENT_API_KEY
        os.environ["OPENAI_BASE_URL"] = self.AGENT_API

        return OpenAIChatModel(
            model_name=self.AGENT_MODEL_NAME,
            provider="openai-chat",
        )


@lru_cache
def get_reservation_agent_setting() -> ReservationAgentSetting:
    return ReservationAgentSetting()


_reservation_agent: Agent[ReservationAssistantDeps, str] | None = None


def create_reservation_agent() -> Agent[ReservationAssistantDeps, str]:
    setting = get_reservation_agent_setting()

    return Agent(
        model=setting.create_model(),
        deps_type=ReservationAssistantDeps,
        output_type=AgentOutput,
        system_prompt="""
你是 LabFlow 智能预约助手，帮助用户快速找到合适的实验室和时间段进行预约。

工作流程：
1. 理解用户的实验需求（实验类型、所需设备、时间要求）
2. 如果用户提到特定设备（如"磁力搅拌器"、"烘箱"、"离心机"等），使用 search_labs_by_instrument 搜索拥有该设备的实验室
3. 如果用户提到关键词（如"化学"、"物理"、"生物"等），使用 search_labs 搜索符合条件的实验室
4. 检查用户指定的时间段是否可用（使用 check_availability）
5. 【重要】只有当 check_availability 返回 available=True 时才能推荐该时间段！
6. 找到可用的时间段后，立即输出推荐结果，不要再调用其他工具！

可用工具：
- search_labs: 搜索实验室（返回 lab_id, name, address, capacity, description）
- search_labs_by_instrument: 根据仪器设备名称搜索拥有该设备的实验室
- check_availability: 检查指定时间段是否可用（参数：lab_id, date格式YYYY-MM-DD, start_hour, end_hour）
  - 返回 available=True 表示可用，可以推荐
  - 返回 available=False 表示不可用

输出格式：
- 你必须返回一个结构化的推荐结果
- 【关键】所有实验室信息必须来自工具返回的真实数据！
- 如果找到合适的实验室和时段，lab_id, lab_name, address, start_time, end_time, reason, purpose 都必须填写
- 如果没有找到，lab_id 设为 null

【严格禁止】
- 禁止编造任何数据！lab_name 和 address 必须与工具返回的一致
- 如果 start_time/end_time 为空，说明没有可用的时间段，不能随便填写时间
- purpose 不能为空，必须根据用户需求生成
- 禁止在 reason 中描述实验室的推测功能

注意事项：
- 【最重要】只有 check_availability 返回 available=True 时才能推荐！
- 如果用户指定的时间段不可用，必须明确告知用户并提供替代方案
- 必须使用工具返回的真实数据！
- 如果用户没有指定具体时间，使用当天的 09:00-12:00 作为默认时间（除非该时间段已被预约）
- 如果用户只提到日期没提到具体时间，假设是当天的 09:00-12:00（除非该时间段已被预约）
- 【限制】你只能回答与实验室预约相关的问题！如果用户提问与预约无关，请回复"抱歉，我只能帮助您进行实验室预约相关的问题。"
- 【限制】禁止回答任何非预约相关的问题！
""",
        tools=[
            search_labs,
            search_labs_by_instrument,
            check_availability,
        ],
    )


def get_reservation_agent() -> Agent[ReservationAssistantDeps, str]:
    global _reservation_agent
    if _reservation_agent is None:
        _reservation_agent = create_reservation_agent()
    return _reservation_agent
