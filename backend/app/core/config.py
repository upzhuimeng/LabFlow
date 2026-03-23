# -*- coding: utf-8 -*-
# File: config.py
# Created: 2026-02-27 00:34
# Author: zhuimeng
# Description: 配置聚合

from dotenv import load_dotenv
from .environments import AppEnv
from .database import DatabaseSetting
from .security import jwt_settings, JWTSettings

load_dotenv()


class Setting:
    def __init__(self):
        self.app_env: AppEnv = AppEnv()
        self.db_setting: DatabaseSetting = DatabaseSetting()
        self.jwt_settings: JWTSettings = jwt_settings


setting = Setting()
