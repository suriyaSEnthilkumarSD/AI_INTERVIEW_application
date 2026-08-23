from datetime import datetime, timezone

from app.database.mongodb import (
    problem_progress_collection,
)

from app.models.problem_progress import (
    ProblemProgress,
)

from app.schemas.problem_progress import (
    ProblemProgressStatus,
)

from app.schemas.submission import (
    SubmissionStatus,
)

from fastapi import HTTPException, status
def update_problem_progress(
    user_id: str,
    problem_id: int,
    submission_status: SubmissionStatus,
):
    now = datetime.now(timezone.utc)

    # Check whether progress already exists
    progress = problem_progress_collection.find_one(
        {
            "user_id": user_id,
            "problem_id": problem_id,
        }
    )

    is_accepted = (
        submission_status == SubmissionStatus.ACCEPTED
    )

    # First attempt
    if not progress:

        progress_status = (
            ProblemProgressStatus.SOLVED
            if is_accepted
            else ProblemProgressStatus.ATTEMPTED
        )

        problem_progress = ProblemProgress(
            user_id=user_id,
            problem_id=problem_id,
            status=progress_status,
            total_attempts=1,
            accepted_attempts=1 if is_accepted else 0,
            failed_attempts=0 if is_accepted else 1,
            first_solved_at=now if is_accepted else None,
            last_attempted_at=now,
        )

        problem_progress_collection.insert_one(
            problem_progress.model_dump()
        )

        return

    # Progress already exists
    update_data = {
        "$inc": {
            "total_attempts": 1,
            "accepted_attempts": 1 if is_accepted else 0,
            "failed_attempts": 0 if is_accepted else 1,
        },
        "$set": {
            "last_attempted_at": now,
            "updated_at": now,
        },
    }

    # First time solving the problem
    if (
        is_accepted
        and progress["status"]
        != ProblemProgressStatus.SOLVED.value
    ):
        update_data["$set"]["status"] = (
            ProblemProgressStatus.SOLVED.value
        )

        update_data["$set"]["first_solved_at"] = now

    problem_progress_collection.update_one(
        {
            "user_id": user_id,
            "problem_id": problem_id,
        },
        update_data,
    )



def get_user_problem_progress(
    user_id: str,
):
    return list(
        problem_progress_collection.find(
            {
                "user_id": user_id
            }
        ).sort(
            "last_attempted_at",
            -1,
        )
    )

def get_problem_progress(
    user_id: str,
    problem_id: int,
):
    progress = problem_progress_collection.find_one(
        {
            "user_id": user_id,
            "problem_id": problem_id,
        }
    )

    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem progress not found",
        )

    return progress


def delete_problem_progress(
    user_id: str,
    problem_id: int,
):
    result = problem_progress_collection.delete_one(
        {
            "user_id": user_id,
            "problem_id": problem_id,
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem progress not found",
        )

    return {
        "message": "Problem progress reset successfully"
    }


def delete_all_problem_progress(
    user_id: str,
):
    result = problem_progress_collection.delete_many(
        {
            "user_id": user_id,
        }
    )

    return {
        "message": "All problem progress reset successfully",
        "deleted_count": result.deleted_count,
    }