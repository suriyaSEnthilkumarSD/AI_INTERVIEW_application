from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.database.mongodb import (
    problems_collection,
    submissions_collection,
)

from app.models.submission import Submission

from app.schemas.submission import (
    SubmissionCreate,
    SubmissionStatus,
    RunCodeRequest,
)

from app.services.problem_progress_service import (
    update_problem_progress,
)

from app.services.execution_service import (
    execute_python_code,
)


# =========================================
# GET PROBLEM
# =========================================

def get_problem_or_404(
    problem_id: int,
):
    problem = problems_collection.find_one(
        {
            "problem_id": problem_id
        }
    )

    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    return problem


# =========================================
# VALIDATE LANGUAGE
# =========================================

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


# =========================================
# UPDATE SUBMISSION RESULT
# =========================================

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

                "test_cases_passed":
                    execution_result[
                        "test_cases_passed"
                    ],

                "total_test_cases":
                    execution_result[
                        "total_test_cases"
                    ],

                "execution_time":
                    execution_result[
                        "execution_time"
                    ],

                "memory_used":
                    execution_result.get(
                        "memory_used"
                    ),

                "error":
                    execution_result.get(
                        "error"
                    ),

                "updated_at":
                    datetime.now(
                        timezone.utc
                    ),
            }
        },
    )


# =========================================
# RUN CODE
#
# IMPORTANT:
# - NO DATABASE INSERT
# - NO PROGRESS UPDATE
# - ONLY PUBLIC TEST CASES
# =========================================

def run_code(
    run_data: RunCodeRequest,
):
    # Get problem
    problem = get_problem_or_404(
        run_data.problem_id
    )

    # Validate language
    validate_submission_language(
        problem=problem,
        language=run_data.language.value,
    )

    # Currently only Python execution exists
    if run_data.language.value != "python":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"{run_data.language.value} "
                "execution is currently unavailable"
            ),
        )

    # Get function signature
    function_signature = (
        problem["code"]["functionSignature"]
    )

    function_name = (
        function_signature["name"]
    )

    parameter_names = [
        parameter["name"]
        for parameter in (
            function_signature["parameters"]
        )
    ]

    # =====================================
    # ONLY PUBLIC TEST CASES
    # =====================================

    public_test_cases = [
        test_case
        for test_case in (
            problem["evaluation"]["testCases"]
        )
        if test_case.get("visibility") == "public"
    ]

    if not public_test_cases:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No public test cases are "
                "available for this problem"
            ),
        )

    # =====================================
    # EXECUTE CODE
    # =====================================

    execution_result = execute_python_code(
        source_code=run_data.source_code,

        function_name=function_name,

        parameter_names=parameter_names,

        test_cases=public_test_cases,
    )

    # IMPORTANT:
    # Return directly.
    #
    # No MongoDB insert.
    # No submission creation.
    # No progress update.

    return execution_result


# =========================================
# CREATE SUBMISSION
# =========================================

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

    # Create submission object
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

    # Currently only Python execution
    if submission_data.language.value != "python":
        return submission

    # Get function signature
    function_signature = (
        problem["code"]["functionSignature"]
    )

    function_name = (
        function_signature["name"]
    )

    parameter_names = [
        parameter["name"]
        for parameter in (
            function_signature["parameters"]
        )
    ]

    # Submit uses ALL test cases
    test_cases = (
        problem["evaluation"]["testCases"]
    )

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

    # Update problem progress
    update_problem_progress(
        user_id=user_id,
        problem_id=submission_data.problem_id,
        submission_status=SubmissionStatus(
            execution_result["status"]
        ),
    )

    # Return updated submission
    return submissions_collection.find_one(
        {
            "submission_id":
                submission.submission_id
        }
    )


# =========================================
# GET SUBMISSION BY ID
# =========================================

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


# =========================================
# GET USER SUBMISSIONS
# =========================================

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


# =========================================
# GET LATEST SUBMISSION
# =========================================

def get_latest_submission_for_problem(
    problem_id: int,
    user_id: str,
):
    submission = submissions_collection.find_one(
        {
            "user_id": user_id,
            "problem_id": problem_id,
        },
        sort=[
            ("created_at", -1),
        ],
    )

    return submission