from pymongo import MongoClient
from app.core.config import settings



client = MongoClient(
    settings.mongodb_url,
    tz_aware=True
)

database = client[settings.database_name]

users_collection = database["users"]
refresh_tokens_collection = database["refresh_tokens"]
problems_collection = database["problems"]
submissions_collection = database["submissions"]
refresh_tokens_collection.create_index(
    "expires_at",
    expireAfterSeconds=0,
)

def create_indexes():
    users_collection.create_index(
        "user_id",
        unique=True
    )

    users_collection.create_index(
        "username",
        unique=True
    )

    users_collection.create_index(
        "email",
        unique=True
    )