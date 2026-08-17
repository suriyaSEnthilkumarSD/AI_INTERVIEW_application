from datetime import datetime, timezone
from uuid import uuid4

from pydantic import BaseModel, Field

from app.schemas.problem import (
    ProblemContent,
    ProblemCode,
    ProblemEvaluation,
    SolutionContext,
    ProblemMetadata,
)


class Problem(BaseModel):
    problem_id: int

    problem_uuid: str = Field(
        default_factory=lambda: str(uuid4())
    )

    slug: str
    title: str
    difficulty: str
    topics: list[str]

    content: ProblemContent
    code: ProblemCode
    evaluation: ProblemEvaluation
    solutionContext: SolutionContext
    metadata: ProblemMetadata

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    