from fastapi import APIRouter, Depends

from app.dependencies.auth import (
    get_current_user,
)

from app.schemas.submission import (
    SubmissionCreate,
    SubmissionResponse,
    SubmissionDetailResponse,
    RunCodeRequest,
    RunCodeResponse,
)

from app.services.submission_service import (
    create_submission,
    run_code,
    get_submission_by_id,
    get_user_submissions,
    get_latest_submission_for_problem,
)


router = APIRouter(
    prefix="/submissions",
    tags=["Submissions"],
)


# =========================================
# RUN CODE
#
# IMPORTANT:
# This route must come BEFORE
# "/{submission_id}"
# =========================================

@router.post(
    "/run",
    response_model=RunCodeResponse,
)
def run_user_code(
    run_data: RunCodeRequest,
    current_user=Depends(get_current_user),
):
    result = run_code(
        run_data=run_data,
    )

    return result


# =========================================
# SUBMIT CODE
# =========================================

@router.post(
    "",
    response_model=SubmissionResponse,
)
def submit_code(
    submission_data: SubmissionCreate,
    current_user=Depends(get_current_user),
):
    submission = create_submission(
        submission_data=submission_data,
        user_id=current_user["user_id"],
    )

    return submission


# =========================================
# GET MY SUBMISSIONS
# =========================================

@router.get(
    "",
    response_model=list[SubmissionResponse],
)
def get_my_submissions(
    current_user=Depends(get_current_user),
):
    submissions = get_user_submissions(
        user_id=current_user["user_id"],
    )

    return submissions


# =========================================
# GET LATEST SUBMISSION
# =========================================

@router.get(
    "/problem/{problem_id}/latest",
    response_model=SubmissionDetailResponse | None,
)
def get_latest_submission(
    problem_id: int,
    current_user=Depends(get_current_user),
):
    submission = (
        get_latest_submission_for_problem(
            problem_id=problem_id,
            user_id=current_user["user_id"],
        )
    )

    return submission


# =========================================
# GET SUBMISSION BY ID
# =========================================

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