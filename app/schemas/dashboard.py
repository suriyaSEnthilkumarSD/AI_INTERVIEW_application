from datetime import datetime

from pydantic import BaseModel

from app.schemas.problem import Difficulty
from app.schemas.submission import (
    Language,
    SubmissionStatus,
)


class OverallStats(BaseModel):
    total_problems: int
    solved_problems: int
    attempted_problems: int
    not_attempted_problems: int


class DifficultyStats(BaseModel):
    difficulty: Difficulty

    total: int
    solved: int
    attempted: int
    not_attempted: int


class AcceptanceStats(BaseModel):
    total_attempts: int
    accepted_attempts: int
    failed_attempts: int

    acceptance_rate: float


class RecentSubmission(BaseModel):
    submission_id: str

    problem_id: int
    problem_title: str

    status: SubmissionStatus
    language: Language

    created_at: datetime


class DashboardResponse(BaseModel):
    overall: OverallStats

    difficulty_stats: list[DifficultyStats]

    acceptance: AcceptanceStats

    recent_submissions: list[RecentSubmission]