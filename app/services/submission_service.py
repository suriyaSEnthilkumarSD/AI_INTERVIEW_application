from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.database.mongodb import (
    problems_collection,
    submissions_collection,
)
from app.models.submission import Submission
from app.schemas.submission import SubmissionCreate
from app.services.execution_service import execute_python_code


def get_problem_or_404(
    problem_id: int,
):
    problem = problems_collection.find_one(
        {"problem_id": problem_id}
    )

    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    return problem


def validate_submission_language(
    problem: dict,
    language: str,
):
    supported_languages = (
        problem["code"]["supportedLanguages"]
    )

    if language not in supported_languages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Selected language is not supported "
                "for this problem"
            ),
        )


def update_submission_result(
    submission_id: str,
    execution_result: dict,
):
    submissions_collection.update_one(
        {
            "submission_id": submission_id
        },
        {
            "$set": {
                "status": execution_result["status"],
                "test_cases_passed": execution_result[
                    "test_cases_passed"
                ],
                "total_test_cases": execution_result[
                    "total_test_cases"
                ],
                "execution_time": execution_result[
                    "execution_time"
                ],
                "memory_used": execution_result.get(
                    "memory_used"
                ),
                "updated_at": datetime.now(
                    timezone.utc
                ),
            }
        },
    )


def create_submission(
    submission_data: SubmissionCreate,
    user_id: str,
):
    # Get problem
    problem = get_problem_or_404(
        submission_data.problem_id
    )

    # Validate language
    validate_submission_language(
        problem=problem,
        language=submission_data.language.value,
    )

    # Create submission
    submission = Submission(
        user_id=user_id,
        problem_id=submission_data.problem_id,
        language=submission_data.language,
        source_code=submission_data.source_code,
    )

    # Save initial submission
    submissions_collection.insert_one(
        submission.model_dump()
    )

    # Currently only Python execution is supported
    if submission_data.language.value != "python":
        return submission

    function_signature = (
        problem["code"]["functionSignature"]
    )

    function_name = function_signature["name"]

    parameter_names = [
        parameter["name"]
        for parameter in function_signature["parameters"]
    ]

    test_cases = problem["evaluation"]["testCases"]

    # Execute code
    execution_result = execute_python_code(
        source_code=submission_data.source_code,
        function_name=function_name,
        parameter_names=parameter_names,
        test_cases=test_cases,
    )

    # Update submission result
    update_submission_result(
        submission_id=submission.submission_id,
        execution_result=execution_result,
    )

    # Return updated submission
    return submissions_collection.find_one(
        {
            "submission_id": submission.submission_id
        }
    )


def get_submission_by_id(
    submission_id: str,
    user_id: str,
):
    submission = submissions_collection.find_one(
        {
            "submission_id": submission_id
        }
    )

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )

    if submission["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not allowed to access "
                "this submission"
            ),
        )

    return submission


def get_user_submissions(
    user_id: str,
):
    return list(
        submissions_collection.find(
            {
                "user_id": user_id
            }
        ).sort(
            "created_at",
            -1,
        )
    )