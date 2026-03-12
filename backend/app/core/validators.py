# -*- coding: utf-8 -*-
# File: validators.py
# Created: 2026-03-11 10:43
# Author: zhuimeng
# Description: 配置校验

import ipaddress
from app.exceptions.base import ConfigError


class Validator:
    true_list: set = {"true"}
    false_list: set = {"false"}

    @staticmethod
    def str_validator(item_name: str, str_data: str) -> str:
        if not str_data:
            raise ConfigError(f"{item_name} 不应为空，请检查.env文件中的配置")

        return str_data

    @classmethod
    def host_validator(cls, item_name, str_host: str) -> str:
        cls.str_validator(item_name, str_host)

        if str_host == "localhost":
            return "localhost"

        try:
            ipaddress.ip_address(str_host)
            return str_host
        except ValueError:
            raise ConfigError(f"配置{item_name}错误，不应为{str_host}")

    @classmethod
    def port_validator(cls, item_name: str, str_port: str) -> int:
        cls.str_validator(item_name, str_port)

        try:
            port: int = int(str_port)
        except (TypeError, ValueError):
            raise ConfigError(
                f"配置{item_name}错误，应为整数，实际为{type(str_port)}:{str_port}"
            )

        if not (1 <= port <= 65535):
            raise ConfigError(f"配置{item_name}错误，应在1-65535，实际为{str_port}")

        return port

    @classmethod
    def bool_validator(cls, item_name: str, str_bool: str) -> bool:
        cls.str_validator(item_name, str_bool)

        str_bool_lower: str = str_bool.lower()

        if str_bool_lower in cls.true_list:
            return True
        elif str_bool_lower in cls.false_list:
            return False

        raise ConfigError(
            f"配置{item_name}错误，应为布尔类型(即TRUE或FALSE)，实际为{str_bool}"
        )
