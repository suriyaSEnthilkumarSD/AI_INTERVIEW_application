from enum import Enum
from datetime import datetime

from pydantic import BaseModel


class ProblemProgressStatus(str, Enum):
    ATTEMPTED = "Attempted"
    SOLVED = "Solved"


class ProblemProgressResponse(BaseModel):

    user_id: str
    problem_id: int

    status: ProblemProgressStatus

    total_attempts: int

    first_solved_at: datetime | None
    last_attempted_at: datetime

    created_at: datetime
    updated_at: datetime

class ProblemProgressListResponse(BaseModel):
    progress: list[ProblemProgressResponse]