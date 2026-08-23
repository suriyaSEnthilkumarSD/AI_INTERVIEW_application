from datetime import datetime, timezone
from uuid import uuid4

from pydantic import BaseModel, Field
from app.schemas.submission import Language, SubmissionStatus


class Submission(BaseModel):

    submission_id: str = Field(
        default_factory=lambda: str(uuid4())
    )

    user_id: str
    problem_id: int

    language: Language
    source_code: str

    status: SubmissionStatus = SubmissionStatus.PENDING

    test_cases_passed: int = 0
    total_test_cases: int = 0

    execution_time: float | None = None
    memory_used: float | None = None

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )