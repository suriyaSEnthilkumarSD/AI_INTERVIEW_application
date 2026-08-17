from fastapi import APIRouter, Depends, status,Query

from app.dependencies.auth import get_current_admin
from app.schemas.problem import ProblemCreate,ProblemUpdate
from app.services.problem_service import create_problem
from app.services.problem_service import (
    get_all_problems_admin,
    get_problem_by_id_admin,
    update_problem,
    patch_problem,
    delete_problem,
)

router = APIRouter(
    prefix="/admin/problems",
    tags=["Admin Problems"]
)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED
)
def create_problem_endpoint(
    data: ProblemCreate,
    current_admin=Depends(get_current_admin),
):
    return create_problem(data)


@router.get("")
def get_admin_problems(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_admin),
):
    return get_all_problems_admin(
        page=page,
        limit=limit,
    )


@router.get("/{problem_id}")
def get_admin_problem(
    problem_id: int,
    current_user=Depends(get_current_admin),
):
    return get_problem_by_id_admin(problem_id)


@router.put("/{problem_id}")
def update_admin_problem(
    problem_id: int,
    data: ProblemCreate,
    current_user=Depends(get_current_admin),
):
    return update_problem(
        problem_id=problem_id,
        data=data,
    )


@router.patch("/{problem_id}")
def patch_admin_problem(
    problem_id: int,
    data: ProblemUpdate,
    current_user=Depends(get_current_admin),
):
    return patch_problem(
        problem_id=problem_id,
        data=data,
    )

@router.delete("/{problem_id}")
def delete_admin_problem(
    problem_id: int,
    current_user=Depends(get_current_admin),
):
    return delete_problem(problem_id)