from datetime import datetime, timezone

from pydantic import BaseModel, Field

from app.schemas.problem_progress import (
    ProblemProgressStatus,
)


class ProblemProgress(BaseModel):

    user_id: str
    problem_id: int

    status: ProblemProgressStatus

    total_attempts: int = 0
    accepted_attempts: int = 0
    failed_attempts: int = 0

    first_solved_at: datetime | None = None

    last_attempted_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )