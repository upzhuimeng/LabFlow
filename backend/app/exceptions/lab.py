from fastapi import Request
from fastapi.responses import JSONResponse
from app.exceptions.business import BusinessError

def register_exception(app):
    # 业务异常
    @app.exception_handler(BusinessError)
    async def business_exception_handler(request: Request, exc: BusinessError):
        return JSONResponse(
            status_code=exc.code,
            content={
                "code": exc.code,
                "message": exc.message,
                "data": {}
            }
        )

    # 系统异常
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "code": 500,
                "message": "Internal Server Error",
                "data": {}
            }
        )