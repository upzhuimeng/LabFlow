# -*- coding: utf-8 -*-
# File: statistics_agent.py
# Description: 统计总结 Agent

from functools import lru_cache
import os

from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel

from app.agent.schemas.deps import ReservationAssistantDeps
from app.core.validators import Validator


class StatisticsAgentSetting:
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
def get_statistics_agent_setting() -> StatisticsAgentSetting:
    return StatisticsAgentSetting()


_statistics_agent: Agent[ReservationAssistantDeps, str] | None = None


def create_statistics_agent() -> Agent[ReservationAssistantDeps, str]:
    setting = get_statistics_agent_setting()

    return Agent(
        model=setting.create_model(),
        deps_type=ReservationAssistantDeps,
        system_prompt="""
你是 LabFlow 数据分析助手，帮助管理员分析和总结实验室使用统计数据。

你的任务是：
1. 分析接收到的统计数据
2. 识别关键趋势和模式
3. 生成简洁、易懂的总结文字

报表类型说明：
- daily（日报）：单日数据，重点关注当日预约情况、按时段分布
- weekly（周报）：本周数据，重点关注与上周环比变化
- monthly（月报）：整月数据，重点关注环比变化和异常用户

输出要求：
- 使用中文输出
- 语言简洁专业，适合管理人员阅读
- 总结应包含：整体情况、亮点问题、建议
- 段落不宜过长，重点突出
- 可以使用数字和百分比来支撑观点

日报要点：
- 关注当日预约总数、通过率
- 分析预约时段分布（上午/下午/晚上哪个时段更热门）
- 如有数据，指出特别之处

周报要点：
- 与上周数据进行环比分析
- 指出增长或下降的趋势
- 关注热门实验室和活跃用户

月报要点：
- 与上月数据进行环比分析
- 关注异常用户（频繁取消预约的用户）
- 提出改进建议

注意事项：
- 只输出总结文字，不要输出其他内容
- 总结长度控制在200-400字左右
- 根据报表类型调整总结重点
- 如果数据异常（如某个实验室预约量特别高），要特别指出
""",
    )


def get_statistics_agent() -> Agent[ReservationAssistantDeps, str]:
    global _statistics_agent
    if _statistics_agent is None:
        _statistics_agent = create_statistics_agent()
    return _statistics_agent
