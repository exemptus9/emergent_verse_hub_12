import secrets
import time
import hashlib
from fastapi import Depends, HTTPException, Query, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import SESSION_DURATION, MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW, MAX_CONTACT_ATTEMPTS, CONTACT_WINDOW

# In-memory stores
admin_sessions = {}  # token -> expiry timestamp
login_attempts = {}  # ip -> (count, first_attempt_time)
contact_attempts = {}  # ip -> (count, first_attempt_time)

security = HTTPBearer(auto_error=False)


def create_admin_token():
    """Generate a secure session token."""
    token = secrets.token_urlsafe(32)
    admin_sessions[token] = time.time() + SESSION_DURATION
    now = time.time()
    expired = [t for t, exp in admin_sessions.items() if exp < now]
    for t in expired:
        del admin_sessions[t]
    return token


def verify_admin_token(token: str) -> bool:
    """Verify a session token is valid and not expired."""
    if token not in admin_sessions:
        return False
    if time.time() > admin_sessions[token]:
        del admin_sessions[token]
        return False
    return True


async def require_admin(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    token: str = Query(None),
):
    """Dependency that enforces admin authentication on routes.
    Checks (in order): httpOnly cookie → Bearer header → query param.
    """
    # 1. httpOnly cookie
    cookie_token = request.cookies.get("admin_token")
    if cookie_token and verify_admin_token(cookie_token):
        return True
    # 2. Bearer header
    if credentials and verify_admin_token(credentials.credentials):
        return True
    # 3. Query param (export URLs)
    if token and verify_admin_token(token):
        return True
    raise HTTPException(status_code=401, detail="Admin authentication required")


def check_rate_limit(ip: str):
    """Check login rate limiting."""
    now = time.time()
    if ip in login_attempts:
        count, first_time = login_attempts[ip]
        if now - first_time > LOGIN_WINDOW:
            login_attempts[ip] = (1, now)
            return True
        if count >= MAX_LOGIN_ATTEMPTS:
            return False
        login_attempts[ip] = (count + 1, first_time)
        return True
    login_attempts[ip] = (1, now)
    return True


def check_contact_rate_limit(ip: str):
    """Check contact form rate limiting."""
    now = time.time()
    if ip in contact_attempts:
        count, first_time = contact_attempts[ip]
        if now - first_time > CONTACT_WINDOW:
            contact_attempts[ip] = (1, now)
            return True
        if count >= MAX_CONTACT_ATTEMPTS:
            return False
        contact_attempts[ip] = (count + 1, first_time)
        return True
    contact_attempts[ip] = (1, now)
    return True


def get_visitor_id(request: Request) -> str:
    """Generate a unique visitor ID based on IP and user agent."""
    forwarded_for = request.headers.get("x-forwarded-for", "")
    real_ip = request.headers.get("x-real-ip", "")

    if forwarded_for:
        ip = forwarded_for.split(",")[0].strip()
    elif real_ip:
        ip = real_ip.strip()
    else:
        ip = request.client.host if request.client else "unknown"

    user_agent = request.headers.get("user-agent", "")
    raw = f"{ip}:{user_agent}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]
