from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr

BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    OPENROUTER_API_KEY: SecretStr = None
    TAVILY_API_KEY: SecretStr = None

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
