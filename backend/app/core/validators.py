# -*- coding: utf-8 -*-
# File: validators.py
# Created: 2026-03-11 10:43
# Author: zhuimeng
# Description: 配置校验

import ipaddress
from app.exceptions.base import ConfigError


class EnvironmentValidators:
    @staticmethod
    def host_validator(host: str) -> str:
        if not host:
            raise ConfigError("HOST 配置不应为空")

        if host == "localhost":
            return "localhost"

        try:
            ipaddress.ip_address(host)
            return host
        except ValueError:
            raise ConfigError(f"HOST:{host} 配置错误")

    @staticmethod
    def port_validator(str_port: str) -> int:
        if not str_port:
            raise ConfigError("PORT 配置不应为空")

        try:
            port: int = int(str_port)
        except (TypeError, ValueError):
            raise ConfigError(f"端口:{str_port} 必须为数字或数字字符串")

        if not (1 <= port <= 65535):
            raise ConfigError(f"端口:{str_port} 端口超出范围，应在1-65535之间")

        return port

    @staticmethod
    def bool_validator(item_name: str, str_bool: str) -> bool:
        if not str_bool:
            raise ConfigError(f"{item_name} 配置不应为空")

        true_list: set = {"true"}
        false_list: set = {"false"}
        str_bool_lower: str = str_bool.lower()

        if str_bool_lower in true_list:
            return True
        elif str_bool_lower in false_list:
            return False

        raise ConfigError(f"{item_name}:{str_bool} 需要为布尔值(True or False)")
