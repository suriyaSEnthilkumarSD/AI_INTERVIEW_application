from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.dependencies.auth import get_current_user
from app.database.mongodb import problems_collection

from app.schemas.ai import (
    AIAnalysisRequest,
    AIAnalysisResponse,
)

from app.services.submission_service import (
    get_submission_by_id,
)

from app.services.ai_service import (
    analyze_submission,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


@router.post(
    "/analyze",
    response_model=AIAnalysisResponse,
)
def analyze_code(
    data: AIAnalysisRequest,
    current_user=Depends(get_current_user),
):
    # Get submission and verify ownership
    submission = get_submission_by_id(
        submission_id=data.submission_id,
        user_id=current_user["user_id"],
    )

    # Get the problem related to the submission
    problem = problems_collection.find_one(
        {
            "problem_id": submission["problem_id"]
        },
        {
            "_id": 0
        }
    )

    # Ensure problem exists
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    # Send submission and problem data to AI
    analysis = analyze_submission(
        submission=submission,
        problem=problem,
        mode=data.mode,
    )

    return analysis