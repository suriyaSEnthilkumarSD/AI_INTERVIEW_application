from fastapi import FastAPI

from app.database.mongodb import client, create_indexes
from app.routers.auth import router as auth_router
from app.routers.problem import router as problem_router 
from app.routers.user import router as user_router
from app.routers import dashboard, submission
from app.routers.progress import router as progress_router
from app.routers.ai import router as ai_router
app = FastAPI(
    title="AI Technical Interview Platform"
)

app.include_router(user_router)
app.include_router(ai_router)
app.include_router(progress_router)
app.include_router(submission.router)
app.include_router(dashboard.router)
create_indexes()

app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "AI Interview Platform API"
    }


@app.get("/test-db")
def test_database():
    try:
        client.admin.command("ping")

        return {
            "message": "MongoDB connection successful"
        }

    except Exception as e:
        return {
            "message": "MongoDB connection failed",
            "error": str(e)
        }


#admin
from app.routers.admin import router as admin_router
app.include_router(admin_router)

app.include_router(problem_router)