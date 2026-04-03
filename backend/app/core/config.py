# -*- coding: utf-8 -*-
# File: config.py
# Created: 2026-02-27 00:34
# Author: zhuimeng
# Description: 配置聚合

import os
from dotenv import load_dotenv

load_dotenv()

from .environments import AppEnv
from .database import DatabaseSetting
from .security import jwt_settings, JWTSettings
from .agents import AgentSetting


class SuperAdminSettings:
    def __init__(self):
        self.USERNAME: str = os.getenv("SUPER_ADMIN_USERNAME", "")
        self.PASSWORD: str = os.getenv("SUPER_ADMIN_PASSWORD", "")


class Setting:
    def __init__(self):
        self.app_env: AppEnv = AppEnv()
        self.db_setting: DatabaseSetting = DatabaseSetting()
        self.jwt_settings: JWTSettings = jwt_settings
        self.agent_setting: AgentSetting = AgentSetting()
        self.super_admin: SuperAdminSettings = SuperAdminSettings()


setting = Setting()
