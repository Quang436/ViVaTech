from fastapi import APIRouter
from app.api.v1 import documents, debate, scorecards

api_router = APIRouter()

api_router.include_router(documents.router)
api_router.include_router(debate.router)
api_router.include_router(scorecards.router)
