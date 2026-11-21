"""Small in-memory rate limiter.

Counts are kept per process, so with several workers each one enforces the
limit separately. That is enough to stop casual abuse of the chat and email
endpoints; a shared store (Redis) would be needed for strict global limits.
"""

import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

from app.config import settings


class RateLimiter:
    def __init__(self, limit: int, window_seconds: float):
        self.limit = limit
        self.window = window_seconds
        self._hits: dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def hit(self, key: str) -> bool:
        """Record a request. Returns False when the key is over its limit."""
        now = time.monotonic()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] >= self.window:
                q.popleft()
            if len(q) >= self.limit:
                return False
            q.append(now)
            return True

    def retry_after(self, key: str) -> int:
        with self._lock:
            q = self._hits.get(key)
            if not q:
                return 0
            return max(1, int(self.window - (time.monotonic() - q[0])) + 1)

    def reset(self):
        with self._lock:
            self._hits.clear()


def client_ip(request: Request) -> str:
    if settings.TRUST_PROXY_HEADERS:
        fwd = request.headers.get("x-forwarded-for")
        if fwd:
            return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def enforce(limiter: RateLimiter, key: str, message: str = "Too many requests. Please try again later."):
    if not limiter.hit(key):
        raise HTTPException(
            status_code=429,
            detail=message,
            headers={"Retry-After": str(limiter.retry_after(key))},
        )


chat_minute_limiter = RateLimiter(settings.CHAT_RATE_LIMIT_PER_MINUTE, 60)
chat_day_limiter = RateLimiter(settings.CHAT_RATE_LIMIT_PER_DAY, 24 * 3600)
auth_limiter = RateLimiter(settings.AUTH_RATE_LIMIT_PER_HOUR, 3600)

ALL_LIMITERS = [chat_minute_limiter, chat_day_limiter, auth_limiter]
