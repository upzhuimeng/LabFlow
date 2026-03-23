# -*- coding: utf-8 -*-
# File: handlers.py
# Created: 2026-03-11 10:24
# Author: zhuimeng
# Description: 全局异常捕获

from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from app.exceptions.business import BusinessError
from app.schemas.common import BaseResponse


async def business_error_handler(request: Request, exc: BusinessError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.code,
        content=BaseResponse(code=exc.code, message=exc.message, data=[]).model_dump(),
    )


async def validation_error_handler(
    request: Request, exc: ValidationError
) -> JSONResponse:
    errors = exc.errors()
    message = "; ".join([f"{e['loc']}: {e['msg']}" for e in errors])
    return JSONResponse(
        status_code=400,
        content=BaseResponse(code=400, message=message, data=[]).model_dump(),
    )


def register_exception_handlers(app):
    app.add_exception_handler(BusinessError, business_error_handler)
    app.add_exception_handler(ValidationError, validation_error_handler)
