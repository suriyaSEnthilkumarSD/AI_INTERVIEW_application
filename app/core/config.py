from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_url: str
    database_name: str

    email_host: str
    email_port: int
    email_username: str
    email_password: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7
    docker_path: str
    sandbox_image: str = "code-sandbox"
    sandbox_memory_limit: str = "128m"
    sandbox_cpu_limit: float = 1
    sandbox_pids_limit: int = 64
    sandbox_tmpfs_size: str = "16m"
    sandbox_timeout_buffer: int = 5
    gemini_api_key: str
    gemini_model: str = "gemini-3.6-flash"
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()


