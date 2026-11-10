from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field

AcademicRoleInput = Literal["student", "researcher", "advisor"]

ROLE_LABELS = {
    "student": "Sinh viên",
    "researcher": "Nghiên cứu sinh",
    "advisor": "Giảng viên hướng dẫn",
}


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    role: AcademicRoleInput = "student"
    remember_me: bool = True


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)
    remember_me: bool = True


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: datetime


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime
    user: UserResponse

