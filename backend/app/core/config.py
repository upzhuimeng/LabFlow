# -*- coding: utf-8 -*-
# File: config.py
# Created: 2026-02-27 00:34
# Author: zhuimeng
# Description: 配置聚合

from .environments import AppEnv


class SETTING:
    def __init__(self):
        self.app_env:AppEnv = AppEnv()
