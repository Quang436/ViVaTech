from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.api_router import api_router
from app.websockets.debate_ws import handle_debate_websocket
# Import models to ensure tables are registered with Base
import app.models

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and directories
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    print("=" * 60)
    print(f"[START] {settings.PROJECT_NAME} v{settings.VERSION} Started")
    print(f"[DOCS] API Docs available at http://127.0.0.1:8000/docs")
    print("=" * 60)
    yield
    print("Shutting down VivaArena backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API cho Nền tảng Mô phỏng Hội đồng Phản biện Học thuật VivaArena (EDUTECH)",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to settings.BACKEND_CORS_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Live Debate WebSocket endpoint
@app.websocket("/ws/debate/{session_id}")
async def debate_websocket_endpoint(websocket: WebSocket, session_id: str):
    await handle_debate_websocket(websocket, session_id)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "concept": "Mô hình Tranh biện cùng Phản biện AI theo Phong cách Hội đồng (AI Debate / Viva Arena)"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
