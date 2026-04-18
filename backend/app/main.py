# -*- coding: utf-8 -*-
# File: main.py
# Created: 2026-03-11 18:23
# Author: zhuimeng
# Description: FastAPI 主程序

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import sys
from app.core.config import setting
from app.exceptions.handlers import register_exception_handlers
from app.api.v1.auth import router as auth_router
from app.api.v1.reservations import router as reservations_router
from app.api.v1.labs import router as labs_router
from app.api.v1.lab_users import router as lab_users_router
from app.api.v1.instruments import router as instruments_router
from app.api.v1.users import router as users_router
from app.api.v1.approvals import router as approvals_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.agent import router as agent_router
from app.api.v1.statistics import router as statistics_router

app = FastAPI(title="LabFlow", version="0.1.0")


@app.get("/health")
async def health_check():
    """健康检查端点"""
    from sqlalchemy import text
    from app.db.session import engine

    status = {"service": "LabFlow", "status": "ok", "database": "ok"}

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        status["status"] = "error"
        status["database"] = f"error: {str(e)}"

    return status


app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        []
        if setting.app_env.CORS_ALLOW_ALL_ORIGINS
        else setting.app_env.CORS_ALLOW_ORIGINS
    ),
    allow_origin_regex=".*" if setting.app_env.CORS_ALLOW_ALL_ORIGINS else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(labs_router)
app.include_router(lab_users_router)
app.include_router(instruments_router)
app.include_router(users_router)
app.include_router(approvals_router)
app.include_router(notifications_router)
app.include_router(reservations_router)
app.include_router(agent_router)
app.include_router(statistics_router)


if __name__ == "__main__":
    app_env = setting.app_env
    is_frozen = getattr(sys, "frozen", False)

    uvicorn.run(
        "app.main:app",
        host=app_env.HOST,
        port=app_env.PORT,
        reload=False if is_frozen else app_env.RELOAD,
    )
