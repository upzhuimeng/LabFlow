# -*- coding: utf-8 -*-
# File: main.py
# Created: 2026-03-11 18:23
# Author: zhuimeng
# Description: FastAPI 主程序

from fastapi import FastAPI
import uvicorn
from app.core.config import SETTING


app = FastAPI(title="LabFlow", version="0.1.0")

if __name__ == "__main__":
    setting:SETTING = SETTING()
    uvicorn.run(
        "app.main:app",
        host=setting.app_env.HOST,
        port=setting.app_env.PORT,
        reload=setting.app_env.RELOAD,
    )
