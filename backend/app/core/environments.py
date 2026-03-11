# -*- coding: utf-8 -*-
# File: environments.py
# Created: 2026-02-27 00:35
# Author: zhuimeng
# Description: 环境配置

import os
from dotenv import load_dotenv
from .validators import EnvironmentValidators

load_dotenv()


class AppEnv:
    def __init__(self):
        self.HOST: str = EnvironmentValidators.host_validator(
            os.getenv("HOST", "0.0.0.0")
        )
        self.PORT: int = EnvironmentValidators.port_validator(os.getenv("PORT", "8000"))
        self.RELOAD: bool = EnvironmentValidators.bool_validator(
            "RELOAD", os.getenv("RELOAD", "False")
        )
