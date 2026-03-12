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
