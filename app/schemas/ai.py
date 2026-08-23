from enum import Enum

from pydantic import BaseModel, Field


class AIAnalysisMode(str, Enum):
    HINT = "hint"
    ANALYSIS = "analysis"
    OPTIMIZATION = "optimization"
    EXPLAIN = "explain"


class AIAnalysisRequest(BaseModel):
    submission_id: str
    mode: AIAnalysisMode = AIAnalysisMode.ANALYSIS


class ComplexityAnalysis(BaseModel):
    current_time: str | None = None
    current_space: str | None = None

    expected_time: str | None = None
    expected_space: str | None = None


class AIAnalysisResponse(BaseModel):
    summary: str

    issue: str | None = None

    hint: str | None = None

    edge_cases: list[str] = Field(
        default_factory=list
    )

    complexity_analysis: ComplexityAnalysis

    suggested_improvement: str | None = None