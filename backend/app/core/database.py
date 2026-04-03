# -*- coding: utf-8 -*-
# File: database.py
# Created: 2026-03-13 00:30
# Author: zhuimeng
# Description: 数据库配置

import os
from .validators import Validator


class DatabaseSetting:
    def __init__(self):
        self.HOST: str = Validator.host_validator(
            "DB_HOST", os.getenv("DB_HOST", "localhost")
        )
        self.PORT: int = Validator.port_validator(
            "DB_PORT", os.getenv("DB_PORT", "3306")
        )
        self.NAME: str = Validator.str_validator(
            "DB_NAME", os.getenv("DB_NAME", "labflow")
        )
        self.USER: str = Validator.str_validator(
            "DB_USER", os.getenv("DB_USER", "root")
        )
        self.PWD: str = Validator.str_validator(
            "DB_PASSWORD", os.getenv("DB_PASSWORD", "")
        )
        self.LOG: bool = Validator.bool_validator(
            "DB_LOG", os.getenv("DB_LOG", "False")
        )
        self.AUTOFLUSH: bool = Validator.bool_validator(
            "DB_AUTO_FLUSH", os.getenv("DB_AUTO_FLUSH", "False")
        )
        self.EXPIREONCOMMIT: bool = Validator.bool_validator(
            "DB_EXPIRE_ON_COMMIT", os.getenv("DB_EXPIRE_ON_COMMIT", "False")
        )

    @property
    def DB_URL(self):
        return f"mysql+asyncmy://{self.USER}:{self.PWD}@{self.HOST}:{self.PORT}/{self.NAME}"

    @property
    def SYNC_DB_URL(self):
        return f"mysql+pymysql://{self.USER}:{self.PWD}@{self.HOST}:{self.PORT}/{self.NAME}"
