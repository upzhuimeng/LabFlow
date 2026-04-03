# -*- coding: utf-8 -*-
# File: rate_limiter.py
# Description: 频率限制工具

import time
from collections import defaultdict
from threading import Lock


class RateLimiter:
    """简单的内存频率限制器（生产环境建议使用 Redis）"""

    def __init__(self, max_requests: int = 3, window_seconds: int = 600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[int, list[float]] = defaultdict(list)
        self._lock = Lock()

    def is_allowed(self, user_id: int) -> tuple[bool, int]:
        """
        检查用户是否允许请求

        Returns:
            (is_allowed, remaining_requests)
        """
        now = time.time()
        window_start = now - self.window_seconds

        with self._lock:
            user_requests = self._requests[user_id]
            user_requests[:] = [t for t in user_requests if t > window_start]

            if len(user_requests) >= self.max_requests:
                remaining = 0
                retry_after = int(self._requests[user_id][0] - window_start)
                return False, remaining

            self._requests[user_id].append(now)
            remaining = self.max_requests - len(self._requests[user_id])
            return True, remaining

    def get_retry_after(self, user_id: int) -> int:
        """获取需要等待的秒数"""
        with self._lock:
            if user_id not in self._requests or not self._requests[user_id]:
                return 0
            oldest = min(self._requests[user_id])
            elapsed = time.time() - oldest
            return max(0, int(self.window_seconds - elapsed))


rate_limiter = RateLimiter(max_requests=3, window_seconds=600)
