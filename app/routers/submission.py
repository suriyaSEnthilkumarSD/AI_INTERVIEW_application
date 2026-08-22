from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.models.user import User

from app.schemas.submission import (
    SubmissionCreate,
    SubmissionResponse,
    SubmissionDetailResponse,
)

from app.services.submission_service import (
    create_submission,
    get_submission_by_id,
    get_user_submissions,
)


router = APIRouter(
    prefix="/submissions",
    tags=["Submissions"],
)


@router.post("", response_model=SubmissionResponse)
def submit_code(
    submission_data: SubmissionCreate,
    current_user=Depends(get_current_user),
):
    submission = create_submission(
        submission_data=submission_data,
        user_id=current_user["user_id"],
    )

    return submission
@router.get("", response_model=list[SubmissionResponse])
def get_my_submissions(
    current_user=Depends(get_current_user),
):
    submissions = get_user_submissions(
        user_id=current_user["user_id"],
    )

    return submissions

@router.get(
    "/{submission_id}",
    response_model=SubmissionDetailResponse,
)
def get_submission(
    submission_id: str,
    current_user=Depends(get_current_user),
):
    submission = get_submission_by_id(
        submission_id=submission_id,
        user_id=current_user["user_id"],
    )

    return submission