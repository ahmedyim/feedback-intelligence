from slowapi import Limiter
from slowapi.util import get_remote_address

# key_func determines what "identity" rate limits are tracked per —
# by default, client IP. You can swap this for a per-user key once
# you have auth context (see note below).
limiter = Limiter(key_func=get_remote_address)