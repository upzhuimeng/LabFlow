# -*- coding: utf-8 -*-
# File: notification.py
# Description: Notification Pydantic schemas

from datetime import datetime
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    type: int
    related_id: int | None
    is_read: int
    created_at: datetime

    class Config:
        from_attributes = True
