import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load .env file explicitly
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    MODEL_NAME = os.getenv("MODEL_NAME", "qwen/qwen3.6-27b")
    DB_PATH = os.getenv("DB_PATH", str(BASE_DIR / "app" / "db" / "rightpath.db"))
    CHROMA_PATH = os.getenv("CHROMA_PATH", str(BASE_DIR.parent / "data_pipeline" / "chroma_data"))
    JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwtkeyforrightpathsessiontokens123!")
    DEMO_MODE = os.getenv("DEMO_MODE", "True").lower() == "true"
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
    COOKIE_SECURE = os.getenv("COOKIE_SECURE", "False").lower() == "true"
    COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax")
    
    # Ensure database folder exists
    db_dir = Path(DB_PATH).parent
    db_dir.mkdir(parents=True, exist_ok=True)
