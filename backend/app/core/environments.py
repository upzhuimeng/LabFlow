# -*- coding: utf-8 -*-
# File: environments.py
# Created: 2026-02-27 00:35
# Author: zhuimeng
# Description: 环境配置

import os
from .validators import Validator


class AppEnv:
    def __init__(self):
        self.HOST: str = Validator.host_validator("HOST", os.getenv("HOST", "0.0.0.0"))
        self.PORT: int = Validator.port_validator("PORT", os.getenv("PORT", "8000"))
        self.RELOAD: bool = Validator.bool_validator(
            "RELOAD", os.getenv("RELOAD", "False")
        )
        cors_origins = os.getenv(
            "CORS_ALLOW_ORIGINS",
            "*",
        )
        parsed_origins = [
            origin.strip() for origin in cors_origins.split(",") if origin.strip()
        ]
        self.CORS_ALLOW_ALL_ORIGINS: bool = (
            len(parsed_origins) == 1 and parsed_origins[0] == "*"
        )
        self.CORS_ALLOW_ORIGINS: list[str] = (
            ["*"] if self.CORS_ALLOW_ALL_ORIGINS else parsed_origins
        )
