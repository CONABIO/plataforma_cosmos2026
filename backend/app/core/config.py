from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "CoSMoS - Plataforma de Divulgacion Comunitaria ANP"
    API_V1_STR: str = "/api/v1"

    # Base de datos
    DATABASE_URL: str = "postgresql://conabio_user:conabio_pass@db:5432/conabio_mvp"

    # IA — compatible con OpenAI API (Ollama, Groq, etc.)
    OPENAI_API_KEY: str = "ollama"
    OPENAI_MODEL: str = "phi3:mini"
    OPENAI_BASE_URL: str = "http://ollama:11434/v1"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # PDF
    PDF_OUTPUT_DIR: str = "/app/generated_pdfs"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
