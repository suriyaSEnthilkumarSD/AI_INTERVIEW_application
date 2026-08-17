from fastapi import HTTPException, status
from datetime import datetime, timezone
from app.database.mongodb import problems_collection
from app.models.problem import Problem
from app.schemas.problem import ProblemCreate, Difficulty, Topic, ProblemUpdate


def create_problem(data: ProblemCreate) -> Problem:

    # Check whether problem_id already exists
    existing_problem = problems_collection.find_one(
        {"problem_id": data.problem_id}
    )

    if existing_problem:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Problem ID already exists",
        )

    # Check whether slug already exists
    existing_slug = problems_collection.find_one(
        {"slug": data.slug}
    )

    if existing_slug:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Problem slug already exists",
        )

    # Create Problem model
    problem = Problem(
        problem_id=data.problem_id,
        slug=data.slug,
        title=data.title,
        difficulty=data.difficulty,
        topics=data.topics,
        content=data.content,
        code=data.code,
        evaluation=data.evaluation,
        solutionContext=data.solutionContext,
        metadata=data.metadata,
    )

    # Convert Pydantic model to MongoDB document
    problem_document = problem.model_dump()

    # Insert into MongoDB
    problems_collection.insert_one(problem_document)

    return problem




def get_all_problems(
    page: int,
    limit: int,
    difficulty: Difficulty | None = None,
    topic: list[Topic] | None = None,
):

    filters = {}

    if difficulty is not None:
        filters["difficulty"] = difficulty.value

    if topic:
        filters["topics"] = {
            "$in": [t.value for t in topic]
        }

    skip = (page - 1) * limit

    total = problems_collection.count_documents(filters)

    problems = list(
        problems_collection
        .find(
            filters,
            {
                "_id": 0,
                "problem_id": 1,
                "slug": 1,
                "title": 1,
                "difficulty": 1,
                "topics": 1,
            }
        )
        .skip(skip)
        .limit(limit)
    )

    total_pages = (total + limit - 1) // limit

    return {
        "problems": problems,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
    }


def get_problem_by_id(problem_id: int):

    problem = problems_collection.find_one(
        {
            "problem_id": problem_id
        },
        {
            "_id": 0
        }
    )

    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    # Keep only public test cases for the user
    if "evaluation" in problem:
        public_test_cases = [
            test_case
            for test_case in problem["evaluation"].get("testCases", [])
            if test_case.get("visibility") == "public"
        ]

        problem["evaluation"]["testCases"] = public_test_cases

    return problem



def get_all_problems_admin(
    page: int,
    limit: int,
):
    skip = (page - 1) * limit

    total = problems_collection.count_documents({})

    problems = list(
        problems_collection
        .find(
            {},
            {
                "_id": 0,
            }
        )
        .skip(skip)
        .limit(limit)
    )

    total_pages = (total + limit - 1) // limit

    return {
        "problems": problems,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
    }


def get_problem_by_id_admin(problem_id: int):

    problem = problems_collection.find_one(
        {"problem_id": problem_id},
        {"_id": 0},
    )

    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    return problem

def update_problem(
    problem_id: int,
    data: ProblemCreate,
):
    # Check whether problem exists
    existing_problem = problems_collection.find_one(
        {"problem_id": problem_id}
    )

    if not existing_problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    # Convert schema data into MongoDB document
    updated_problem = {
        "problem_id": problem_id,
        "slug": data.slug,
        "title": data.title,
        "difficulty": data.difficulty.value,
        "topics": [topic.value for topic in data.topics],
        "content": data.content.model_dump(),
        "code": data.code.model_dump(),
        "evaluation": data.evaluation.model_dump(),
        "solutionContext": data.solutionContext.model_dump(),
        "metadata": data.metadata.model_dump(),
    }

    # Update the document
    problems_collection.update_one(
        {"problem_id": problem_id},
        {"$set": updated_problem},
    )

    # Return updated problem
    updated = problems_collection.find_one(
        {"problem_id": problem_id},
        {"_id": 0},
    )

    return updated


def patch_problem(
    problem_id: int,
    data: ProblemUpdate,
):
    existing_problem = problems_collection.find_one(
        {"problem_id": problem_id}
    )

    if not existing_problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "difficulty" in update_data:
        update_data["difficulty"] = (
            data.difficulty.value
        )

    if "topics" in update_data:
        update_data["topics"] = [
            topic.value
            for topic in data.topics
        ]

    if "content" in update_data:
        update_data["content"] = (
            data.content.model_dump()
        )

    if "code" in update_data:
        update_data["code"] = (
            data.code.model_dump()
        )

    if "evaluation" in update_data:
        update_data["evaluation"] = (
            data.evaluation.model_dump()
        )

    if "solutionContext" in update_data:
        update_data["solutionContext"] = (
            data.solutionContext.model_dump()
        )

    if "metadata" in update_data:
        update_data["metadata"] = (
            data.metadata.model_dump()
        )

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    problems_collection.update_one(
        {"problem_id": problem_id},
        {"$set": update_data},
    )

    updated_problem = problems_collection.find_one(
        {"problem_id": problem_id},
        {"_id": 0},
    )

    return updated_problem


def delete_problem(problem_id: int):

    # Check whether problem exists
    existing_problem = problems_collection.find_one(
        {"problem_id": problem_id}
    )

    if not existing_problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    # Delete the problem
    problems_collection.delete_one(
        {"problem_id": problem_id}
    )

    return {
        "message": "Problem deleted successfully",
        "problem_id": problem_id,
    }