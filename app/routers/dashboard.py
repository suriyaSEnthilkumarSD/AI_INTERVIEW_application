from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user

from app.schemas.dashboard import (
    DashboardResponse,
)

from app.services.dashboard_service import (
    get_dashboard,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "",
    response_model=DashboardResponse,
)
def get_dashboard_data(
    current_user=Depends(get_current_user),
):
    return get_dashboard(
        user_id=current_user["user_id"],
    )