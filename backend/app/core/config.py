# -*- coding: utf-8 -*-
# File: config.py
# Created: 2026-02-27 00:34
# Author: zhuimeng
# Descriptaion: 通用配置

from .environments import BaseEnv, DevEnv, ProdEnv
from .exceptions import ConfigError
from typing import Type


class EnvConfig:
    """
    环境配置类
    """

    # 添加环境配置
    env_map: dict[str, Type[BaseEnv]] = {"DEV": DevEnv, "PROD": ProdEnv}

    def __init__(self, env: str = "DEV") -> None:
        """
        初始化环境配置

        Args:
            env: 环境名称, 可选: DEV, PROD
        """
        if env not in self.env_map:
            raise ConfigError(f"Unknown enviroment: {env}")

        # 加载对应配置的类对象
        self.env: BaseEnv = self.env_map[env]()

    @property
    def HOST(self) -> str:
        return self.env.HOST

    @property
    def PORT(self) -> int:
        return self.env.PORT

    @property
    def RELOAD(self) -> bool:
        return self.env.RELOAD

