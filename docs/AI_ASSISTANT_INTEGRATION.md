# Pydantic AI 集成指南 - 智能预约助手

## 目录
1. [概述](#1-概述)
2. [核心概念](#2-核心概念)
3. [快速入门](#3-快速入门)
4. [Pydantic AI vs 传统方案](#4-pydantic-ai-vs-传统方案)
5. [集成到 LabFlow](#5-集成到-labflow)
6. [智能预约助手设计](#6-智能预约助手设计)
7. [实现示例](#7-实现示例)
8. [API 接口设计](#8-api-接口设计)
9. [前端集成](#9-前端集成)
10. [下一步](#10-下一步)

---

## 1. 概述

### 什么是 Pydantic AI？

**Pydantic AI** 是 Pydantic 团队开发的 Python AI Agent 框架，旨在让 GenAI 应用开发像 FastAPI 一样简洁、类型安全。

**GitHub**: https://github.com/pydantic/pydantic-ai (16k+ stars)
**文档**: https://ai.pydantic.dev/

### 为什么选择 Pydantic AI？

| 特性 | 说明 |
|------|------|
| Pydantic 团队开发 | OpenAI SDK、Anthropic SDK、LangChain 等都在用 Pydantic |
| 模型无关 | 支持 OpenAI、Gemini、DeepSeek、Qwen 等所有主流模型 |
| 类型安全 | 依赖注入 + 静态类型检查，减少运行时错误 |
| 工具支持 | @agent.tool 装饰器轻松注册函数工具 |
| 结构化输出 | Pydantic 模型保证输出格式正确 |
| 可观测性 | 与 Pydantic Logfire 深度集成 |

---

## 2. 核心概念

### 2.1 Agent（智能体）

Agent 是与 LLM 交互的主要接口，包含：

```
Agent = 模型 + 指令 + 工具 + 输出类型 + 依赖类型
```

```python
from pydantic_ai import Agent

agent = Agent(
    'openai:gpt-5.2',                    # 模型
    instructions='你是实验室预约助手',     # 系统指令
    tools=[...],                          # 工具列表
    output_type=ReservationResult,        # 结构化输出
    deps_type=AgentDeps,                  # 依赖类型
)
```

### 2.2 依赖注入（Dependency Injection）

通过 `RunContext` 在工具函数中访问依赖，实现类型安全的数据传递：

```python
from dataclasses import dataclass
from pydantic_ai import Agent, RunContext

@dataclass
class AgentDeps:
    user_id: int
    db: DatabaseConn

@agent.tool
async def get_user_reservations(ctx: RunContext[AgentDeps]) -> list[Reservation]:
    return await ctx.deps.db.get_user_reservations(ctx.deps.user_id)
```

### 2.3 工具（Tools）

两种注册方式：

```python
# 方式1: @agent.tool - 需要 RunContext 访问依赖
@agent.tool
async def get_labs(ctx: RunContext[AgentDeps], status: int = 0) -> list[Lab]:
    """获取实验室列表"""
    return await ctx.deps.db.get_labs(status=status)

# 方式2: @agent.tool_plain - 不需要依赖的简单工具
@agent.tool_plain
def get_current_time() -> str:
    """获取当前时间"""
    return datetime.now().isoformat()
```

### 2.4 结构化输出

使用 Pydantic 模型定义输出格式：

```python
from pydantic import BaseModel, Field
from datetime import datetime

class ReservationSuggestion(BaseModel):
    lab_id: int = Field(description="推荐的实验室ID")
    lab_name: str = Field(description="实验室名称")
    start_time: datetime = Field(description="推荐开始时间")
    end_time: datetime = Field(description="推荐结束时间")
    reason: str = Field(description="推荐理由")

class ReservationResult(BaseModel):
    success: bool
    suggestion: ReservationSuggestion | None = None
    message: str
```

---

## 3. 快速入门

### 3.1 安装

```bash
cd backend
uv add pydantic-ai
```

### 3.2 最小示例

```python
from pydantic_ai import Agent

agent = Agent('openai:gpt-5.2')

result = agent.run_sync('我想预约一个化学实验室做实验')
print(result.output)
```

### 3.3 带工具的示例

```python
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel

agent = Agent(
    'openai:gpt-5.2',
    output_type=LabListOutput,
)

@agent.tool
async def search_labs(ctx: RunContext, keyword: str) -> list[dict]:
    """搜索实验室"""
    return await ctx.deps.db.search_labs(keyword)

result = agent.run_sync(
    '找一个有 PCR 仪的实验室',
    deps=AgentDeps(user_id=1, db=database)
)
```

---

## 4. Pydantic AI vs 传统方案

### 4.1 对比 LangChain

| 方面 | LangChain | Pydantic AI |
|------|-----------|-------------|
| 类型安全 | 较弱 | 强（基于 Pydantic） |
| 学习曲线 | 陡峭 | 平缓（类 FastAPI 风格） |
| 输出验证 | 需要额外配置 | 原生支持 |
| 依赖注入 | 支持但不直观 | 简洁直观 |
| 文档质量 | 参差不齐 | 优秀 |

### 4.2 核心优势

**1. 类型推导**
```python
# LangChain
chain = LLMChain(llm=llm, prompt=prompt)  # 无类型提示

# Pydantic AI
agent: Agent[AgentDeps, OutputType] = Agent(...)  # 完整类型提示
```

**2. 输出验证**
```python
# LangChain - 需要额外解析
output = chain.invoke({"input": "..."})
parsed = json.loads(output.text)

# Pydantic AI - 自动验证
result = agent.run_sync("...", deps=deps)
# result.output 已经是经过验证的 OutputType 类型
```

---

## 5. 集成到 LabFlow

### 5.1 项目结构

```
backend/app/
├── agent/
│   ├── __init__.py
│   ├── config.py          # Agent 配置
│   ├── schemas/           # Agent 相关 Pydantic 模型
│   │   ├── __init__.py
│   │   └── reservation.py  # 预约相关结构
│   ├── prompts/           # 提示词模板
│   │   ├── __init__.py
│   │   └── reservation.py
│   ├── tools/             # Agent 工具
│   │   ├── __init__.py
│   │   ├── lab.py        # 实验室查询工具
│   │   ├── reservation.py # 预约查询工具
│   │   └── time.py       # 时间处理工具
│   ├── agents/            # Agent 定义
│   │   ├── __init__.py
│   │   └── reservation_assistant.py
│   └── utils/             # 工具函数
│       ├── __init__.py
│       └── time_utils.py
```

### 5.2 依赖配置

```python
# backend/app/core/agents.py

import os
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from app.agent.config import AgentConfig

class AgentSetting:
    def __init__(self):
        self.MODEL_NAME: str = os.getenv("AGENT_MODEL_NAME", "qwen2.5-72b-instruct")
        self.API_BASE: str = os.getenv("AGENT_API_BASE", "https://api.deepseek.com/v1")
        self.API_KEY: str = os.getenv("AGENT_API_KEY", "")
        
    def create_model(self):
        return OpenAIModel(
            self.MODEL_NAME,
            base_url=self.API_BASE,
            api_key=self.API_KEY,
        )

agent_settings = AgentSetting()
```

### 5.3 依赖类型

```python
# backend/app/agent/schemas/deps.py

from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession

@dataclass
class AgentDeps:
    """Agent 依赖"""
    user_id: int
    db: AsyncSession
    user_name: str | None = None

@dataclass
class ReservationAssistantDeps(AgentDeps):
    """预约助手依赖"""
    pass
```

---

## 6. 智能预约助手设计

### 6.1 功能目标

用户描述需求 → AI 分析 → 推荐实验室和时间 → 跳转表单确认

```
用户: "我想明天下午2点到5点在化学楼做一个有机合成实验"

AI 分析:
1. 调用 search_labs 搜索化学相关实验室
2. 调用 check_availability 检查可用时间
3. 返回推荐结果

输出:
{
    "success": true,
    "suggestion": {
        "lab_id": 3,
        "lab_name": "化学楼 A301",
        "start_time": "2026-04-04T14:00:00",
        "end_time": "2026-04-04T17:00:00",
        "reason": "化学楼 A301 实验室有通风橱，适合有机合成实验，明天下午2-5点可用"
    },
    "message": "已为您找到合适的实验室，请确认后提交预约"
}
```

### 6.2 工具设计

```python
# 工具列表

@agent.tool
async def search_labs(
    ctx: RunContext[ReservationAssistantDeps],
    keyword: str | None = None,
    required_equipment: str | None = None
) -> list[LabInfo]:
    """搜索实验室
    
    Args:
        keyword: 关键词（如"化学"、"物理"）
        required_equipment: 需要的设备（如"通风橱"、"PCR仪"）
    """
    ...

@agent.tool
async def check_availability(
    ctx: RunContext[ReservationAssistantDeps],
    lab_id: int,
    date: str,
    start_hour: int,
    end_hour: int
) -> AvailabilityResult:
    """检查实验室在指定时间段是否可用"""
    ...

@agent.tool
async def get_lab_details(
    ctx: RunContext[ReservationAssistantDeps],
    lab_id: int
) -> LabDetail:
    """获取实验室详细信息"""
    ...

@agent.tool
async def get_user_reservations(
    ctx: RunContext[ReservationAssistantDeps]
) -> list[UserReservation]:
    """获取当前用户的预约列表"""
    ...
```

### 6.3 输出结构

```python
class ReservationSuggestion(BaseModel):
    lab_id: int = Field(description="推荐的实验室ID")
    lab_name: str = Field(description="实验室名称")
    address: str = Field(description="实验室地址")
    start_time: datetime = Field(description="推荐开始时间")
    end_time: datetime = Field(description="推荐结束时间")
    reason: str = Field(description="推荐理由")
    equipment: list[str] = Field(default=[], description="可用设备")

class ReservationAssistantResult(BaseModel):
    success: bool = Field(description="是否成功找到推荐")
    suggestion: ReservationSuggestion | None = Field(default=None, description="推荐结果")
    message: str = Field(description="返回消息")
    available_slots: list[TimeSlot] = Field(default=[], description="其他可用时间段")
```

---

## 7. 实现示例

### 7.1 依赖安装

```bash
cd backend
uv add pydantic-ai
uv add pydantic-ai-slim
```

### 7.2 Agent 实现

```python
# backend/app/agent/agents/reservation_assistant.py

from dataclasses import dataclass
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext

from app.agent.schemas.deps import ReservationAssistantDeps
from app.agent.schemas.reservation import (
    ReservationSuggestion,
    TimeSlot,
    ReservationAssistantResult,
)


# 预约助手 Agent
reservation_agent = Agent[ReservationAssistantDeps, ReservationAssistantResult](
    'openai:qwen2.5-72b-instruct',
    deps_type=ReservationAssistantDeps,
    output_type=ReservationAssistantResult,
    system_prompt="""
你是 LabFlow 智能预约助手，帮助用户快速找到合适的实验室和时间段。

工作流程：
1. 理解用户的实验需求（实验类型、所需设备、时间要求）
2. 搜索符合条件的实验室
3. 检查时间可用性
4. 推荐最佳方案

注意：
- 只推荐状态正常的实验室（status=0）
- 只返回审批通过的时间段
- 如果首选时间不可用，提供替代方案
- 保持回复简洁，突出关键信息
""",
)


@reservation_agent.instructions
async def add_user_context(ctx: RunContext[ReservationAssistantDeps]) -> str:
    """动态添加用户上下文"""
    return f"当前用户: {ctx.deps.user_name or '未知'} (ID: {ctx.deps.user_id})"


@reservation_agent.tool
async def search_labs(
    ctx: RunContext[ReservationAssistantDeps],
    keyword: str | None = None,
) -> list[dict[str, Any]]:
    """搜索实验室"""
    from app.crud import lab as lab_crud
    
    labs, _ = await lab_crud.get_labs(
        ctx.deps.db,
        status=0,  # 只返回正常状态的实验室
        keyword=keyword,
    )
    
    return [
        {
            "id": lab.id,
            "name": lab.name,
            "address": lab.address,
            "capacity": lab.capacity,
            "description": lab.description,
        }
        for lab in labs
    ]


@reservation_agent.tool
async def check_availability(
    ctx: RunContext[ReservationAssistantDeps],
    lab_id: int,
    date: str,  # YYYY-MM-DD
    start_hour: int,
    end_hour: int,
) -> dict[str, Any]:
    """检查实验室可用性"""
    from datetime import datetime, timedelta
    from app.crud import reservation as reservation_crud
    
    start_time = datetime.strptime(f"{date} {start_hour}:00", "%Y-%m-%d %H:%M")
    end_time = datetime.strptime(f"{date} {end_hour}:00", "%Y-%m-%d %H:%M")
    
    conflicts = await reservation_crud.check_time_conflict(
        ctx.deps.db,
        lab_id=lab_id,
        start_time=start_time,
        end_time=end_time,
    )
    
    if conflicts:
        return {
            "available": False,
            "reason": "该时间段已被预约",
            "conflicts": [
                {"start": c.start_time.isoformat(), "end": c.end_time.isoformat()}
                for c in conflicts
            ],
        }
    
    return {"available": True, "reason": ""}


@reservation_agent.tool
async def get_lab_details(
    ctx: RunContext[ReservationAssistantDeps],
    lab_id: int,
) -> dict[str, Any] | None:
    """获取实验室详情"""
    from app.crud import lab as lab_crud
    
    lab = await lab_crud.get_lab_by_id(ctx.deps.db, lab_id)
    if not lab or lab.status != 0:
        return None
    
    manager_id, manager_name = await lab_crud.get_lab_manager(ctx.deps.db, lab_id)
    
    return {
        "id": lab.id,
        "name": lab.name,
        "address": lab.address,
        "capacity": lab.capacity,
        "description": lab.description,
        "manager": manager_name,
    }


@reservation_agent.tool
async def get_user_reservations(
    ctx: RunContext[ReservationAssistantDeps],
) -> list[dict[str, Any]]:
    """获取用户已有预约"""
    from app.crud import reservation as reservation_crud
    
    reservations, _ = await reservation_crud.get_reservations_by_user(
        ctx.deps.db,
        user_id=ctx.deps.user_id,
    )
    
    return [
        {
            "id": r.id,
            "lab_name": "待补充",  # 需要 join
            "start_time": r.start_time.isoformat(),
            "end_time": r.end_time.isoformat(),
            "status": r.status,
        }
        for r in reservations
    ]


# 快捷调用函数
async def find_reservation(
    user_id: int,
    user_name: str | None,
    db: AsyncSession,
    user_request: str,
) -> ReservationAssistantResult:
    """查找预约建议"""
    deps = ReservationAssistantDeps(
        user_id=user_id,
        user_name=user_name,
        db=db,
    )
    
    result = await reservation_agent.run(user_request, deps=deps)
    return result.output
```

### 7.3 API 接口

```python
# backend/app/api/v1/agent.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.agent.agents.reservation_assistant import find_reservation
from pydantic import BaseModel

router = APIRouter(prefix="/agent", tags=["智能助手"])


class ReservationAssistantRequest(BaseModel):
    message: str = Field(..., description="用户的需求描述")


class ReservationAssistantResponse(BaseModel):
    success: bool
    suggestion: dict | None
    message: str
    available_slots: list[dict]


@router.post("/reservation/assist", response_model=ReservationAssistantResponse)
async def assist_reservation(
    request: ReservationAssistantRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    智能预约助手
    
    用户描述需求，返回推荐的实验室和时间段
    """
    result = await find_reservation(
        user_id=current_user.id,
        user_name=current_user.name,
        db=db,
        user_request=request.message,
    )
    
    return ReservationAssistantResponse(
        success=result.success,
        suggestion=result.suggestion.model_dump() if result.suggestion else None,
        message=result.message,
        available_slots=[s.model_dump() for s in result.available_slots],
    )
```

---

## 8. API 接口设计

### 8.1 智能预约助手接口

**POST /api/v1/agent/reservation/assist**

请求：
```json
{
    "message": "我想预约一个化学实验室做有机合成实验，明天下午2点到5点"
}
```

响应：
```json
{
    "success": true,
    "suggestion": {
        "lab_id": 3,
        "lab_name": "化学楼 A301 实验室",
        "address": "化学楼 3 层",
        "start_time": "2026-04-04T14:00:00",
        "end_time": "2026-04-04T17:00:00",
        "reason": "化学楼 A301 配备通风橱，适合有机合成实验，且明天下午2-5点无人预约",
        "equipment": ["通风橱", "旋转蒸发仪", "磁力搅拌器"]
    },
    "message": "已为您找到合适的实验室，请确认后提交预约",
    "available_slots": [
        {"start": "2026-04-04T09:00:00", "end": "2026-04-04T12:00:00"},
        {"start": "2026-04-04T14:00:00", "end": "2026-04-04T17:00:00"}
    ]
}
```

### 8.2 跳转到预约表单

前端拿到 suggestion 后，填充预约表单：

```javascript
// 伪代码
const handleAssistantResult = (result) => {
    if (result.success && result.suggestion) {
        // 跳转到预约表单，并预填充数据
        const params = new URLSearchParams({
            lab_id: result.suggestion.lab_id,
            start_time: result.suggestion.start_time,
            end_time: result.suggestion.end_time,
            purpose: '有机合成实验',
            from_assistant: 'true'
        });
        
        router.push(`/reservation/create?${params}`);
    }
};
```

---

## 9. 前端集成

### 9.1 智能助手组件

```jsx
// frontend/components/ReservationAssistant.jsx
'use client';

import { useState } from 'react';

export default function ReservationAssistant() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await fetch('/api/v1/agent/reservation/assist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
                credentials: 'include',
            });
            
            const data = await res.json();
            setResult(data);
            
            if (data.success && data.suggestion) {
                // 跳转到预约表单
                const params = new URLSearchParams({
                    lab_id: data.suggestion.lab_id,
                    start_time: data.suggestion.start_time,
                    end_time: data.suggestion.end_time,
                    from_assistant: 'true',
                });
                router.push(`/reservation/create?${params}`);
            }
        } catch (error) {
            console.error('Assistant error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">智能预约助手</h2>
            
            <form onSubmit={handleSubmit}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="描述您的实验需求，如：我想预约一个化学实验室做有机合成实验，明天下午2点到5点"
                    className="w-full p-3 border rounded mb-4"
                    rows={3}
                />
                
                <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    {loading ? '分析中...' : '帮我找实验室'}
                </button>
            </form>
            
            {result && !result.success && (
                <p className="mt-4 text-red-600">{result.message}</p>
            )}
        </div>
    );
}
```

### 9.2 预约表单预填充

```jsx
// frontend/app/(dashboard)/reservation/create/page.jsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CreateReservationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [formData, setFormData] = useState({
        lab_id: '',
        start_time: '',
        end_time: '',
        purpose: '',
    });

    useEffect(() => {
        // 从智能助手跳转过来的预填充
        const labId = searchParams.get('lab_id');
        const startTime = searchParams.get('start_time');
        const endTime = searchParams.get('end_time');
        const fromAssistant = searchParams.get('from_assistant');

        if (labId && fromAssistant === 'true') {
            setFormData({
                lab_id: labId,
                start_time: startTime,
                end_time: endTime,
                purpose: searchParams.get('purpose') || '',
            });
        }
    }, [searchParams]);

    // ... 表单提交逻辑
}
```

---

## 10. 下一步

### 立即可用

1. **安装依赖**: `uv add pydantic-ai`
2. **配置环境变量**: 在 `.env` 中添加 `AGENT_MODEL_NAME`、`AGENT_API_KEY` 等
3. **实现基础 Agent**: 参考第 7 节的代码
4. **创建 API 接口**: 参考第 8 节
5. **前端集成**: 参考第 9 节

### 可选增强

1. **流式输出**: 使用 `agent.run_stream()` 实现打字机效果
2. **多轮对话**: 保存 `result.messages()` 实现连续对话
3. **人类确认**: 使用 [Deferred Tools](https://ai.pydantic.dev/deferred-tools/#human-in-the-loop-tool-approval) 实现工具执行前确认
4. **日志追踪**: 集成 Pydantic Logfire 追踪 Agent 执行
5. **测试**: 使用 `agent.run_sync()` 配合 `TestModel` 进行单元测试

### 参考资源

- 官方文档: https://ai.pydantic.dev/
- GitHub: https://github.com/pydantic/pydantic-ai
- 示例代码: https://github.com/pydantic/pydantic-ai/tree/main/examples
