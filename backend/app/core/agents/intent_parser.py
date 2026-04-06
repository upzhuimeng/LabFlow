# -*- coding: utf-8 -*-
# File: intent_parser.py
# Description: 用户意图解析器

import os
from functools import lru_cache
from datetime import datetime

from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel

from app.agent.schemas.deps import ReservationAssistantDeps
from app.agent.schemas.reservation_assistant import UserIntent
from app.core.validators import Validator


class IntentParserSetting:
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
def get_intent_parser_setting() -> IntentParserSetting:
    return IntentParserSetting()


_intent_parser: Agent[ReservationAssistantDeps, str] | None = None


def create_intent_parser() -> Agent[ReservationAssistantDeps, str]:
    setting = get_intent_parser_setting()
    now = datetime.now()
    current_date = now.strftime("%Y-%m-%d")
    tomorrow_date = (now + __import__("datetime").timedelta(days=1)).strftime(
        "%Y-%m-%d"
    )

    return Agent(
        model=setting.create_model(),
        deps_type=ReservationAssistantDeps,
        output_type=str,
        system_prompt=f"""
你是 LabFlow 预约意图解析器。从用户消息中提取预约相关信息。

当前日期：{current_date}
明天日期：{tomorrow_date}

【提取任务】
从用户消息中提取以下信息：

1. keyword（实验室类型关键词）：从"XX实验室"中提取"XX"
2. equipment（仪器设备）：用户明确提到的设备名称
3. date：提到"明天"则为"tomorrow"，否则为具体日期
4. start_hour / end_hour（24小时制）
5. purpose（用途）

【输出格式】
输出一行 JSON，不要其他内容：
{{"keyword":"物理","equipment":null,"date":"tomorrow","start_hour":14,"end_hour":18,"purpose":null}}

【注意】
- 时间用24小时制数字
- 未提及的字段设为 null
- 只输出一行 JSON
""",
        tools=[],
    )

    return Agent(
        model=setting.create_model(),
        deps_type=ReservationAssistantDeps,
        output_type=UserIntent,
        system_prompt=f"""
你是 LabFlow 预约意图解析器。从用户消息中提取预约相关信息。

当前日期：{current_date}
明天日期：{tomorrow_date}

【提取任务】
从用户消息中提取以下信息：

1. keyword（实验室类型关键词）：从"XX实验室"中提取"XX"
   - "物理实验室" → keyword="物理"
   - "化学实验室" → keyword="化学"
   - "生物实验室" → keyword="生物"

2. equipment（仪器设备）：用户明确提到的设备名称

3. date（日期）：
   - 提到"明天" → date="tomorrow"
   - 提到具体日期如"4月8日" → date="2026-04-08"

4. start_hour / end_hour（时间，24小时制）：
   - "下午3点到5点" → start_hour=15, end_hour=17
   - "下午"（无具体时间）→ start_hour=14, end_hour=18
   - "上午9点到12点" → start_hour=9, end_hour=12

5. purpose（用途）：用户说明的实验内容或预约目的

【示例】
"预约明天下午的物理实验室"
→ {{"keyword": "物理", "equipment": null, "date": "tomorrow", "start_hour": 14, "end_hour": 18, "purpose": null}}

"我想用烘箱做实验，今天下午3点到5点"
→ {{"keyword": null, "equipment": "烘箱", "date": "today", "start_hour": 15, "end_hour": 17, "purpose": "实验"}}

"帮我预约化学实验室"
→ {{"keyword": "化学", "equipment": null, "date": null, "start_hour": null, "end_hour": null, "purpose": null}}

【输出格式】
返回一行 JSON 对象，包含上述所有字段。
""",
        tools=[],
    )

    return Agent(
        model=setting.create_model(),
        deps_type=ReservationAssistantDeps,
        output_type=UserIntent,
        system_prompt=f"""
你是 LabFlow 预约意图解析器。从用户消息中提取预约相关信息。

当前日期：{current_date}
明天日期：{tomorrow_date}

【提取规则】
根据用户消息内容，提取以下信息并返回 JSON：

- keyword：从"物理实验室"、"化学实验室"等中提取"物理"、"化学"等关键词
- equipment：用户提到的仪器设备，如"烘箱"、"离心机"等
- date：如果提到"明天"则设为"tomorrow"，提到具体日期则用 YYYY-MM-DD 格式
- start_hour：用户提到的时间转换为24小时制（下午3点=15，下午5点=17）
- end_hour：同上
- purpose：如果用户说明了实验内容或用途，填在这里

【示例】
输入："预约明天下午的物理实验室"
输出：{{"keyword": "物理", "equipment": null, "date": "tomorrow", "start_hour": 14, "end_hour": 18, "purpose": null}}

输入："我想用烘箱做实验，今天下午3点到5点"
输出：{{"keyword": null, "equipment": "烘箱", "date": "today", "start_hour": 15, "end_hour": 17, "purpose": "实验"}}

输入："帮我预约化学实验室"
输出：{{"keyword": "化学", "equipment": null, "date": null, "start_hour": null, "end_hour": null, "purpose": null}}

【重要】
- 只从消息中提取明确提到的信息，不要猜测
- 时间必须用24小时制数字（如14、15、17）
- 返回的 JSON 必须符合 UserIntent 格式
""",
        tools=[],
    )


def get_intent_parser() -> Agent[ReservationAssistantDeps, str]:
    global _intent_parser
    if _intent_parser is None:
        _intent_parser = create_intent_parser()
    return _intent_parser
