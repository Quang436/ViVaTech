import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import AuthSession, User

PBKDF2_ITERATIONS = 200_000
security_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )
    return f"pbkdf2_sha256${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        scheme, salt_hex, expected_hex = stored_hash.split("$", 2)
        if scheme != "pbkdf2_sha256":
            return False
        salt = bytes.fromhex(salt_hex)
        computed = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            PBKDF2_ITERATIONS,
        )
        return hmac.compare_digest(computed.hex(), expected_hex)
    except Exception:
        return False


def hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def create_auth_session(
    db: Session,
    user_id: str,
    remember_me: bool = True,
) -> tuple[str, datetime]:
    raw_token = secrets.token_urlsafe(36)
    expires_at = datetime.utcnow() + (
        timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
        if remember_me
        else timedelta(hours=settings.SESSION_EPHEMERAL_HOURS)
    )
    auth_session = AuthSession(
        user_id=user_id,
        token_hash=hash_token(raw_token),
        expires_at=expires_at,
    )
    db.add(auth_session)
    db.commit()
    return raw_token, expires_at


def resolve_user_from_token(db: Session, raw_token: str) -> Optional[User]:
    if not raw_token:
        return None
    token_digest = hash_token(raw_token)
    auth_session = (
        db.query(AuthSession)
        .filter(
            AuthSession.token_hash == token_digest,
            AuthSession.revoked_at.is_(None),
        )
        .first()
    )
    if not auth_session:
        return None
    if auth_session.expires_at <= datetime.utcnow():
        return None
    return db.query(User).filter(User.id == auth_session.user_id).first()


def revoke_auth_token(db: Session, raw_token: str) -> bool:
    if not raw_token:
        return False
    token_digest = hash_token(raw_token)
    auth_session = (
        db.query(AuthSession)
        .filter(
            AuthSession.token_hash == token_digest,
            AuthSession.revoked_at.is_(None),
        )
        .first()
    )
    if not auth_session:
        return False
    auth_session.revoked_at = datetime.utcnow()
    db.commit()
    return True


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not credentials or credentials.scheme.lower() != "bearer" or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Vui lòng đăng nhập để truy cập dữ liệu cá nhân.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = resolve_user_from_token(db, credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

