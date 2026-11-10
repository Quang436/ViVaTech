import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_auth_session,
    get_current_user,
    hash_password,
    revoke_auth_token,
    security_scheme,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    ROLE_LABELS,
    AuthTokenResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _to_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        name=user.full_name,
        email=user.email,
        role=user.role,
        created_at=user.created_at,
    )


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register_account(payload: RegisterRequest, db: Session = Depends(get_db)):
    clean_name = payload.full_name.strip()
    clean_email = payload.email.strip().lower()

    if len(clean_name) < 2:
        raise HTTPException(status_code=400, detail="Họ và tên phải có ít nhất 2 ký tự.")
    if not EMAIL_REGEX.match(clean_email):
        raise HTTPException(status_code=400, detail="Địa chỉ email không đúng định dạng.")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Mật khẩu phải có ít nhất 6 ký tự.")

    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email này đã được đăng ký. Vui lòng chuyển sang tab Đăng nhập.",
        )

    user = User(
        full_name=clean_name,
        email=clean_email,
        password_hash=hash_password(payload.password),
        role=ROLE_LABELS.get(payload.role, "Sinh viên"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token, expires_at = create_auth_session(db, user.id, remember_me=payload.remember_me)
    return AuthTokenResponse(
        access_token=token,
        expires_at=expires_at,
        user=_to_user_response(user),
    )


@router.post("/login", response_model=AuthTokenResponse)
def login_account(payload: LoginRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    if not EMAIL_REGEX.match(clean_email):
        raise HTTPException(status_code=400, detail="Địa chỉ email không đúng định dạng.")

    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không chính xác.",
        )

    token, expires_at = create_auth_session(db, user.id, remember_me=payload.remember_me)
    return AuthTokenResponse(
        access_token=token,
        expires_at=expires_at,
        user=_to_user_response(user),
    )


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return _to_user_response(current_user)


@router.post("/logout")
def logout_account(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if credentials and credentials.credentials:
        revoke_auth_token(db, credentials.credentials)
    return {"status": "logged_out", "user_id": current_user.id}

