from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/user",
    tags=["User"],
)


@router.get("/me")
def get_my_profile(
    current_user = Depends(get_current_user),
):

    return {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "email": current_user["email"],
    }

#temporary admin check
# from app.dependencies.auth import get_current_admin
# @router.get("/admin-test")
# def admin_test(
#     admin = Depends(get_current_admin)
# ):
#     return {
#         "message": "You are an admin",
#         "user_id": admin["user_id"],
#         "role": admin.get("role", "user")
#     }