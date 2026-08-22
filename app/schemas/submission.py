from enum import Enum
from datetime import datetime

from pydantic import BaseModel


class Language(str, Enum):
    PYTHON = "python"
    CPP = "cpp"
    JAVA = "java"


class SubmissionStatus(str, Enum):
    PENDING = "Pending"
    RUNNING = "Running"
    ACCEPTED = "Accepted"
    WRONG_ANSWER = "Wrong Answer"
    RUNTIME_ERROR = "Runtime Error"
    COMPILATION_ERROR = "Compilation Error"
    TIME_LIMIT_EXCEEDED = "Time Limit Exceeded"
    MEMORY_LIMIT_EXCEEDED = "Memory Limit Exceeded"


class SubmissionCreate(BaseModel):
    problem_id: int
    language: Language
    source_code: str


class SubmissionResponse(BaseModel):
    submission_id: str

    user_id: str
    problem_id: int

    language: Language
    status: SubmissionStatus

    test_cases_passed: int
    total_test_cases: int

    execution_time: float | None
    memory_used: float | None

    created_at: datetime
    updated_at: datetime


class SubmissionDetailResponse(SubmissionResponse):
    source_code: str