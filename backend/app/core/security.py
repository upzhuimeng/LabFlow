# -*- coding: utf-8 -*-
# File: security.py
# Created: 2026-03-23 09:24
# Author: zhuimeng
# Description: 安全工具 (密码哈希、JWT、Cookie)

import os
from datetime import datetime, timedelta, timezone
from typing import Any

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHash
from jose import JWTError, jwt
from fastapi import Response

from .validators import Validator


class PasswordHasherTool:
    _ph = PasswordHasher()

    @staticmethod
    def hash(password: str) -> str:
        return PasswordHasherTool._ph.hash(password)

    @staticmethod
    def verify(password: str, hashed: str) -> bool:
        try:
            PasswordHasherTool._ph.verify(hashed, password)
            return True
        except (VerifyMismatchError, InvalidHash):
            return False


class JWTSettings:
    def __init__(self):
        self.SECRET_KEY: str = Validator.str_validator(
            "JWT_SECRET_KEY", os.getenv("JWT_SECRET_KEY", "")
        )
        self.ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
        self.EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))


jwt_settings = JWTSettings()


class JWTTools:
    @staticmethod
    def create_token(user_id: int, extra: dict | None = None) -> str:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=jwt_settings.EXPIRE_MINUTES
        )
        to_encode: dict[str, Any] = {"sub": str(user_id), "exp": expire}
        if extra:
            to_encode.update(extra)
        return jwt.encode(
            to_encode, jwt_settings.SECRET_KEY, algorithm=jwt_settings.ALGORITHM
        )

    @staticmethod
    def decode_token(token: str) -> int | None:
        try:
            payload = jwt.decode(
                token, jwt_settings.SECRET_KEY, algorithms=[jwt_settings.ALGORITHM]
            )
            user_id = payload.get("sub")
            if user_id is None:
                return None
            return int(user_id)
        except JWTError:
            return None


class CookieTools:
    @staticmethod
    def set_token(response: Response, token: str) -> None:
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=jwt_settings.EXPIRE_MINUTES * 60,
        )

    @staticmethod
    def clear_token(response: Response) -> None:
        response.delete_cookie(key="access_token")


hash_password = PasswordHasherTool.hash
verify_password = PasswordHasherTool.verify
create_access_token = JWTTools.create_token
decode_token = JWTTools.decode_token
set_token_cookie = CookieTools.set_token
clear_token_cookie = CookieTools.clear_token
