from fastapi import APIRouter, Depends, Query
from app.dependencies.auth import get_current_user
from app.services.problem_service import (
    get_all_problems,
    get_problem_by_id,
)
from app.schemas.problem import (
    ProblemListResponse,
    ProblemDetailResponse,
    Difficulty,
    Topic,
)
router = APIRouter(
    prefix="/problems",
    tags=["Problems"],
)


@router.get(
    "",
    response_model=ProblemListResponse
)
def get_problems(
    difficulty: Difficulty | None = Query(
        default=None
    ),
    topic: list[Topic] | None = Query(
        default=None
    ),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    return get_all_problems(
        page=page,
        limit=limit,
        difficulty=difficulty,
        topic=topic,
    )

@router.get("/{problem_id}",response_model=ProblemDetailResponse)
def get_problem(
    problem_id: int,
    current_user=Depends(get_current_user),
):
    return get_problem_by_id(problem_id)