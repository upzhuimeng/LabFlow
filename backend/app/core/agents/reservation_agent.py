# -*- coding: utf-8 -*-
# File: reservation_agent.py
# Description: 预约助手 Agent

from functools import lru_cache
import os
from datetime import datetime

from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel

from app.agent.schemas.deps import ReservationAssistantDeps
from app.agent.tools import (
    search_labs,
    check_availability,
    search_labs_by_instrument,
    get_date_info,
)
from app.core.validators import Validator


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
        os.environ["OPENAI_API_KEY"] = self.AGENT_API_KEY
        os.environ["OPENAI_BASE_URL"] = self.AGENT_API

        return OpenAIChatModel(
            model_name=self.AGENT_MODEL_NAME,
            provider="openai-chat",
        )


@lru_cache
def get_reservation_agent_setting() -> AgentSetting:
    return AgentSetting()


_reservation_agent: Agent[ReservationAssistantDeps, str] | None = None


def create_reservation_agent() -> Agent[ReservationAssistantDeps, str]:
    setting = get_reservation_agent_setting()
    now = datetime.now()
    current_date = now.strftime("%Y-%m-%d")
    current_year = now.year
    tomorrow_date = (now + __import__("datetime").timedelta(days=1)).strftime(
        "%Y-%m-%d"
    )

    return Agent(
        model=setting.create_model(),
        deps_type=ReservationAssistantDeps,
        output_type=str,
        system_prompt=f"""
你是 LabFlow 智能预约助手，帮助用户预约实验室。

当前日期：{current_date}，明天日期：{tomorrow_date}，今年是 {current_year} 年。

【重要】你必须按顺序执行：
1. 首先调用 get_date_info 获取日期信息
2. 调用 search_labs 或 search_labs_by_instrument 搜索实验室
3. 调用 check_availability 验证时间段
4. 只有 available=True 才能推荐

【输出要求】
完成搜索和验证后，输出一行 JSON（不要其他内容）：
{{"lab_id":1,"lab_name":"实验室名称","address":"地址","start_time":"2026-04-08T14:00:00","end_time":"2026-04-08T18:00:00","reason":"推荐理由","purpose":"用途"}}

如果找不到可用实验室：{{"lab_id":null}}

【禁止】
- 不要编造实验室信息
- 不要返回过去的时间
- 未经搜索直接输出结果
""",
        tools=[
            get_date_info,
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
