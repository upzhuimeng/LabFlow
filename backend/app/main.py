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
from app.api.v1.reservations import router as reservations_router
from app.api.v1.labs import router as labs_router
from app.api.v1.lab_users import router as lab_users_router
from app.api.v1.instruments import router as instruments_router
from app.api.v1.users import router as users_router
from app.api.v1.approvals import router as approvals_router
from app.api.v1.notifications import router as notifications_router


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
app.include_router(labs_router)
app.include_router(lab_users_router)
app.include_router(instruments_router)
app.include_router(users_router)
app.include_router(approvals_router)
app.include_router(notifications_router)
app.include_router(reservations_router)


if __name__ == "__main__":
    app_env = setting.app_env

    uvicorn.run(
        "app.main:app",
        host=app_env.HOST,
        port=app_env.PORT,
        reload=app_env.RELOAD,
    )
