from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError

from core.config import settings
from models.user import UserModel
from schemas.auth import LoginRequest, ForgotPasswordRequest, UpdatePasswordRequest

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
RESET_TOKEN_EXPIRE_MINUTES = settings.RESET_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS  # add this to your Settings class, e.g. = 7

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire, "type": "access"},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def create_reset_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire, "type": "password_reset"},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def create_refresh_token() -> str:
    """
    Opaque random refresh token — NOT a JWT. Unlike access tokens, refresh
    tokens don't need to carry claims; keeping them opaque means a stolen
    token is useless without the corresponding server-side hash record,
    and revocation is a simple DB update rather than a blocklist.
    """
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str) -> str:
    """
    SHA-256, not bcrypt. Refresh tokens are already high-entropy random
    strings (unlike passwords), so we don't need bcrypt's deliberate
    slowness — we need fast, deterministic hashing so we can look the
    token up directly with a DB query (WHERE refresh_token_hash = ?).
    """
    return hashlib.sha256(token.encode()).hexdigest()


def verify_refresh_token(token: str, token_hash: str) -> bool:
    """Constant-time comparison to avoid timing side-channels."""
    return hmac.compare_digest(hash_refresh_token(token), token_hash)


def authenticate(db: Session, payload: LoginRequest) -> dict:
    """
    Used by POST /auth/login

    Defense in depth:
      1. slowapi handles IP-based rate limiting (5/min) at the router layer.
      2. This function handles per-account lockout after repeated failures,
         which protects against attackers rotating IPs.
    """
    user = db.query(UserModel).filter(UserModel.email == payload.email).first()

    # Account-level lockout check — happens before password verification
    if user and user.locked_until:
        now = datetime.now(timezone.utc)
        if user.locked_until > now:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Account temporarily locked due to too many failed login attempts. Try again later.",
            )
        else:
            # lock has expired — clear it before proceeding
            user.locked_until = None
            user.failed_login_attempts = 0

    # Always run verify_password even if user is None, using a dummy hash,
    # to keep response timing consistent and avoid leaking "email doesn't exist"
    # via response-time differences.
    dummy_hash = "$2b$12$CwTycUXWue0Thq9StjUM0uJ8t1P3mMYNcXqvS8B.k2ZbAxexJKQfy"
    password_valid = verify_password(
        payload.password,
        user.hashed_password if user else dummy_hash,
    )

    if not user or not password_valid:
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    # Successful login — reset failure tracking
    user.failed_login_attempts = 0
    user.locked_until = None

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token()

    # Store only the hash server-side so it can be revoked/rotated,
    # and so a DB leak doesn't hand out usable refresh tokens.
    user.refresh_token_hash = hash_refresh_token(refresh_token)
    user.refresh_token_expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,  # raw value — router sets this as the HttpOnly cookie only, never re-exposed in JSON
    }


def refresh_access_token(db: Session, raw_refresh_token: str) -> dict:
    """
    Used by POST /auth/refresh
    Validates the refresh token cookie, rotates it, and issues a new access token.
    """
    if not raw_refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

    token_hash = hash_refresh_token(raw_refresh_token)
    user = db.query(UserModel).filter(UserModel.refresh_token_hash == token_hash).first()

    if not user or not verify_refresh_token(raw_refresh_token, user.refresh_token_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if user.refresh_token_expires_at and user.refresh_token_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    # Rotation: issue a brand new refresh token and invalidate the old one.
    # Limits damage if a refresh token is ever stolen — it becomes single-use.
    new_refresh_token = create_refresh_token()
    user.refresh_token_hash = hash_refresh_token(new_refresh_token)
    user.refresh_token_expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    db.commit()

    new_access_token = create_access_token(user.id)

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "refresh_token": new_refresh_token,
    }


def revoke_refresh_token(db: Session, user_id: str) -> None:
    """Used by POST /auth/logout — invalidates the stored refresh token hash."""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if user:
        user.refresh_token_hash = None
        user.refresh_token_expires_at = None
        db.commit()


def initiate_password_reset(db: Session, payload: ForgotPasswordRequest) -> dict:
    """
    Used by POST /auth/forgot-password
    Always returns the same generic message to prevent user enumeration.
    """
    user = db.query(UserModel).filter(UserModel.email == payload.email).first()

    if user:
        reset_token = create_reset_token(user.id)
        # TODO: send via email/SMS provider — never return token in the response
        # send_reset_email(to=user.email, token=reset_token)

    return {"message": "If an account with that email exists, a reset link has been sent."}


def update_password(db: Session, payload: UpdatePasswordRequest) -> dict:
    """
    Used by POST /auth/update-password
    """
    try:
        decoded = jwt.decode(
            payload.reset_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    if decoded.get("type") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token type",
        )

    user = db.query(UserModel).filter(UserModel.id == decoded.get("sub")).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.hashed_password = hash_password(payload.new_password)
    # Reset any lockout state on successful password change
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()

    return {"message": "Password updated successfully."}