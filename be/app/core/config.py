from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()


class Settings(BaseSettings):
    APP_NAME: str = "Aksara API"
    DEBUG: bool = True
    SQL_ECHO: bool = False  # Terpisah dari DEBUG — echo query SQL sangat verbose di terminal

    # Database
    DATABASE_URL: str = "mysql+mysqlconnector://root:@localhost:3306/aksara_db"

    # Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash"

    class Config:
        env_file = ".env"
        extra = "ignore"  # Izinkan extra env vars tanpa error


settings = Settings()

# Override dari environment variable jika ada (prioritas tertinggi)
if os.getenv("DATABASE_URL"):
    settings.DATABASE_URL = os.getenv("DATABASE_URL")
if os.getenv("GEMINI_API_KEY"):
    settings.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if os.getenv("GEMINI_MODEL"):
    settings.GEMINI_MODEL = os.getenv("GEMINI_MODEL")
