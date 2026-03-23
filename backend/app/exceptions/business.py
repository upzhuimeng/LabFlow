# -*- coding: utf-8 -*-
# File: business.py
# Created: 2026-03-11 10:21
# Author: zhuimeng
# Description: 业务错误异常


class BusinessError(Exception):
    code: int = 400

    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class RegisterError(BusinessError):
    code: int = 400


class AuthError(BusinessError):
    code: int = 401


class NotFoundError(BusinessError):
    code: int = 404


class AlreadyExistsError(BusinessError):
    code: int = 409
