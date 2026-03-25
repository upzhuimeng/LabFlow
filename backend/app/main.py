# -*- coding: utf-8 -*-
# File: main.py
# Created: 2026-03-11 18:23
# Author: zhuimeng
# Description: FastAPI 主程序

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.core.config import setting
from app.exceptions.handlers import register_exception_handlers
from app.api.v1.auth import router as auth_router
from app.api.v1.tags import router as tags_router

app = FastAPI(title="LabFlow", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(tags_router)

if __name__ == "__main__":
    app_env = setting.app_env

    uvicorn.run(
        "app.main:app",
        host=app_env.HOST,
        port=app_env.PORT,
        reload=app_env.RELOAD,
    )
