# -*- coding: utf-8 -*-
# File: environments.py
# Created: 2026-02-27 00:35
# Author: zhuimeng
# Descriptaion: 环境配置


class BaseEnv:
    """
    基础环境，uvicorn参数配置

    Args:
        HOST: 服务启动IP
        PORT: 服务启动端口
        RELOAD: 是否启用热加载
        DEBUG: 是否DeBug
    """

    HOST: str
    PORT: int
    RELOAD: bool


class DevEnv(BaseEnv):
    HOST = "127.0.0.1"
    PORT = 8000
    RELOAD = True


class ProdEnv(BaseEnv):
    HOST = "0.0.0.0"
    PORT = 8000
    RELOAD = False
