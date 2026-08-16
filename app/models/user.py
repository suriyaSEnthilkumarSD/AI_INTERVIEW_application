from datetime import datetime, timezone
from uuid import UUID, uuid4

from pydantic import BaseModel, EmailStr, Field


class User(BaseModel):
    user_id: str = Field(
    default_factory=lambda: str(uuid4())
)

    username: str
    email: EmailStr
    password_hash: str

    is_verified: bool = False

    otp_hash: str | None = None
    otp_expires_at: datetime | None = None
    otp_failed_attempts: int = 0

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    otp_sent_at: datetime | None = None