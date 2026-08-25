from pydantic_settings import BaseSettings,SettingsConfigDict
class Settings(BaseSettings):
    DB_URL: str 
    SECRET_KEY: str 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    RESET_TOKEN_EXPIRE_MINUTES:int=60
    admin_email: str = "admin@fineto.fi"
    admin_password: str = "changeme123"  # override via .env, never commit real value
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )
settings = Settings()