# -*- coding: utf-8 -*-
# File: __init__.py
# Description: Agent Schemas 导出

from .deps import AgentDeps, ReservationAssistantDeps
from .reservation_assistant import (
    TimeSlot,
    LabInfo,
    LabDetail,
    ReservationSuggestion,
    AvailabilityResult,
    ReservationAssistantResult,
)

__all__ = [
    "AgentDeps",
    "ReservationAssistantDeps",
    "TimeSlot",
    "LabInfo",
    "LabDetail",
    "ReservationSuggestion",
    "AvailabilityResult",
    "ReservationAssistantResult",
]
