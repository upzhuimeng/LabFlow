# -*- coding: utf-8 -*-
# File: context_storage.py
# Description: 智能体上下文文件存储工具

import json
import hashlib
from pathlib import Path
from datetime import datetime


CONTEXT_DIR = Path(__file__).parent.parent.parent / "data" / "agent_contexts"
CONTEXT_DIR.mkdir(parents=True, exist_ok=True)


def generate_context_filename(user_id: int) -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
    raw = f"{user_id}_{timestamp}"
    hash_part = hashlib.md5(raw.encode()).hexdigest()[:16]
    return f"{user_id}_{hash_part}.json"


def save_context(user_id: int, data: dict) -> str:
    filename = generate_context_filename(user_id)
    filepath = CONTEXT_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return filename


def load_context(filename: str) -> dict | None:
    filepath = CONTEXT_DIR / filename
    if not filepath.exists():
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def update_context(filename: str, data: dict) -> bool:
    filepath = CONTEXT_DIR / filename
    if not filepath.exists():
        return False
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return True


def delete_context(filename: str) -> bool:
    filepath = CONTEXT_DIR / filename
    if not filepath.exists():
        return False
    filepath.unlink()
    return True
