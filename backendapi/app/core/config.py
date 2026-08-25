from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from fastapi_mail import ConnectionConfig

class Settings(BaseSettings):
    # Accept DB_URL, or fall back to Vercel's auto-injected variables
    DB_URL: Optional[str] = None
    POSTGRES_URL: Optional[str] = None
    DATABASE_URL: Optional[str] = None

    SECRET_KEY: str 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    RESET_TOKEN_EXPIRE_MINUTES: int = 60
    ADMIN_EMAIL: str 
    ADMIN_PASSWORD: str  

    # Email Settings
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int = 587
    MAIL_SERVER: str
    MAIL_FROM_NAME: str = "Fineto Support"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def get_database_url(self) -> str:
        # 1. Grab whichever variable is available
        url = self.DB_URL or self.POSTGRES_URL or self.DATABASE_URL
        if not url:
            raise ValueError("No database URL found in environment variables!")

        # 2. Convert postgres:// to postgresql:// for SQLAlchemy compatibility
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
            
        return url

settings = Settings()

mail_config = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=int(settings.MAIL_PORT),
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)