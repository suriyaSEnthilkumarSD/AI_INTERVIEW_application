from app.database.mongodb import (
    problems_collection,
    problem_progress_collection,
    submissions_collection,
)
from app.schemas.problem import Difficulty

def get_overall_statistics(
    user_id: str,
):
    # Total problems in the platform
    total_problems = problems_collection.count_documents(
        {}
    )

    # Problems solved by the user
    solved_problems = (
        problem_progress_collection.count_documents(
            {
                "user_id": user_id,
                "status": "Solved",
            }
        )
    )

    # Problems attempted but not solved
    attempted_problems = (
        problem_progress_collection.count_documents(
            {
                "user_id": user_id,
                "status": "Attempted",
            }
        )
    )

    # Problems never attempted
    not_attempted_problems = (
        total_problems
        - solved_problems
        - attempted_problems
    )

    return {
        "total_problems": total_problems,
        "solved_problems": solved_problems,
        "attempted_problems": attempted_problems,
        "not_attempted_problems": not_attempted_problems,
    }



def get_difficulty_statistics(
    user_id: str,
):
    difficulty_stats = []

    for difficulty in Difficulty:

        # Get all problem IDs for this difficulty
        problems = list(
            problems_collection.find(
                {
                    "difficulty": difficulty.value
                },
                {
                    "problem_id": 1,
                    "_id": 0,
                },
            )
        )

        problem_ids = [
            problem["problem_id"]
            for problem in problems
        ]

        total = len(problem_ids)

        # User's solved problems in this difficulty
        solved = (
            problem_progress_collection.count_documents(
                {
                    "user_id": user_id,
                    "problem_id": {
                        "$in": problem_ids
                    },
                    "status": "Solved",
                }
            )
        )

        # User's attempted problems in this difficulty
        attempted = (
            problem_progress_collection.count_documents(
                {
                    "user_id": user_id,
                    "problem_id": {
                        "$in": problem_ids
                    },
                    "status": "Attempted",
                }
            )
        )

        not_attempted = (
            total
            - solved
            - attempted
        )

        difficulty_stats.append(
            {
                "difficulty": difficulty,
                "total": total,
                "solved": solved,
                "attempted": attempted,
                "not_attempted": not_attempted,
            }
        )

    return difficulty_stats


def get_acceptance_statistics(
    user_id: str,
):
    total_attempts = submissions_collection.count_documents(
        {
            "user_id": user_id,
        }
    )

    accepted_attempts = submissions_collection.count_documents(
        {
            "user_id": user_id,
            "status": "Accepted",
        }
    )

    failed_attempts = (
        total_attempts
        - accepted_attempts
    )

    acceptance_rate = (
        round(
            (
                accepted_attempts
                / total_attempts
            )
            * 100,
            2,
        )
        if total_attempts > 0
        else 0.0
    )

    return {
        "total_attempts": total_attempts,
        "accepted_attempts": accepted_attempts,
        "failed_attempts": failed_attempts,
        "acceptance_rate": acceptance_rate,
    }

def get_recent_submissions(
    user_id: str,
    limit: int = 5,
):
    submissions = list(
        submissions_collection.find(
            {
                "user_id": user_id,
            }
        )
        .sort(
            "created_at",
            -1,
        )
        .limit(limit)
    )

    recent_submissions = []

    for submission in submissions:

        problem = problems_collection.find_one(
            {
                "problem_id": submission["problem_id"]
            },
            {
                "_id": 0,
                "title": 1,
            },
        )

        recent_submissions.append(
            {
                "submission_id": submission["submission_id"],
                "problem_id": submission["problem_id"],
                "problem_title": (
                    problem["title"]
                    if problem
                    else "Unknown Problem"
                ),
                "status": submission["status"],
                "language": submission["language"],
                "created_at": submission["created_at"],
            }
        )

    return recent_submissions


def get_dashboard(
    user_id: str,
):
    overall = get_overall_statistics(
        user_id=user_id,
    )

    difficulty_stats = get_difficulty_statistics(
        user_id=user_id,
    )

    acceptance = get_acceptance_statistics(
        user_id=user_id,
    )

    recent_submissions = get_recent_submissions(
        user_id=user_id,
    )

    return {
        "overall": overall,
        "difficulty_stats": difficulty_stats,
        "acceptance": acceptance,
        "recent_submissions": recent_submissions,
    }


