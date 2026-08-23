import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load .env file explicitly (only present in local dev, not on Render)
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    MODEL_NAME = os.getenv("MODEL_NAME", "qwen/qwen3-32b")

    # On Render, CHROMA_PATH and DB_PATH are set via environment variables.
    # Defaults resolve relative to the backend root for local dev.
    DB_PATH = os.getenv("DB_PATH", str(BASE_DIR / "app" / "db" / "rightpath.db"))
    CHROMA_PATH = os.getenv("CHROMA_PATH", str(BASE_DIR / "chroma_data"))

    JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwtkeyforrightpathsessiontokens123!")
    DEMO_MODE = os.getenv("DEMO_MODE", "True").lower() == "true"
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()

    # Production: COOKIE_SECURE=True, COOKIE_SAMESITE=none (cross-origin on Render)
    # Development: COOKIE_SECURE=False, COOKIE_SAMESITE=lax
    COOKIE_SECURE = os.getenv("COOKIE_SECURE", "False").lower() == "true"
    COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax")

    # Ensure database folder exists at startup
    db_dir = Path(DB_PATH).parent
    db_dir.mkdir(parents=True, exist_ok=True)

