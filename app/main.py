from fastapi import FastAPI

from app.database.mongodb import client, create_indexes
from app.routers.auth import router as auth_router

from app.routers.user import router as user_router
app = FastAPI(
    title="AI Technical Interview Platform"
)

app.include_router(user_router)
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