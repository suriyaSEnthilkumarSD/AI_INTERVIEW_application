from datetime import datetime,timezone

from pydantic import BaseModel, Field


class RefreshToken(BaseModel):
    token_id: str
    user_id: str

    token_hash: str

    expires_at: datetime

    revoked: bool = False

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )