from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "VivaArena - AI Academic Debate Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Gemini API Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-3.8-flash"
    
    # Database
    DATABASE_URL: str = "sqlite:///./viva_arena.db"
    
    # Vector DB (ChromaDB)
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"
    
    # Upload Settings
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 25
    
    # Speech & External Services
    WHISPER_API_KEY: str = os.getenv("WHISPER_API_KEY", "")
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    
    # Interactive Streaming Digital Human (HeyGen & D-ID WebRTC)
    HEYGEN_API_KEY: str = os.getenv("HEYGEN_API_KEY", "")
    HEYGEN_AVATAR_ID: str = os.getenv("HEYGEN_AVATAR_ID", "Wayne_20240711")
    HEYGEN_VOICE_ID: str = os.getenv("HEYGEN_VOICE_ID", "vi-VN-NamMinhNeural")
    
    DID_API_KEY: str = os.getenv("DID_API_KEY", "")
    DID_AGENT_ID: str = os.getenv("DID_AGENT_ID", "")
    DID_PRESENTER_ID: str = os.getenv("DID_PRESENTER_ID", "v2_public_alex@qcvo4gupoy")
    DID_VOICE_ID: str = os.getenv("DID_VOICE_ID", "vi-VN-NamMinhNeural")
    DID_SOURCE_URL: str = os.getenv("DID_SOURCE_URL", "")

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
