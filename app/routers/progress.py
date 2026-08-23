
from fastapi import (
    APIRouter,
    Depends,
    Query,
    HTTPException,
    status,
)
from app.dependencies.auth import get_current_user

from app.schemas.problem_progress import (
    ProblemProgressListResponse,
    ProblemProgressResponse,
)

from app.services.problem_progress_service import (
    get_user_problem_progress,
    get_problem_progress,
    delete_problem_progress,
    delete_all_problem_progress,
)


router = APIRouter(
    prefix="/progress",
    tags=["Problem Progress"],
)


@router.get(
    "",
    response_model=ProblemProgressListResponse,
)
def get_progress(
    current_user=Depends(get_current_user),
):
    progress = get_user_problem_progress(
        user_id=current_user["user_id"],
    )

    return {
        "progress": progress
    }


@router.get(
    "/{problem_id}",
    response_model=ProblemProgressResponse,
)
def get_progress_by_problem(
    problem_id: int,
    current_user=Depends(get_current_user),
):
    return get_problem_progress(
        user_id=current_user["user_id"],
        problem_id=problem_id,
    )

@router.delete(
    "/{problem_id}",
)
def reset_problem_progress(
    problem_id: int,
    current_user=Depends(get_current_user),
):
    return delete_problem_progress(
        user_id=current_user["user_id"],
        problem_id=problem_id,
    )

@router.delete("")
def reset_all_problem_progress(
    confirm: bool = Query(default=False),
    current_user=Depends(get_current_user),
):
    if not confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This action will reset all problem progress. "
                "Set confirm=true to continue. "
                "Submission history will not be deleted."
            ),
        )

    return delete_all_problem_progress(
        user_id=current_user["user_id"],
    )