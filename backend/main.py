# main.py

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from routers import blog
from services.model_service import model_service
from database.mongo import connect_db, disconnect_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info("Starting SEO Blog Engine...")

    connect_db()
    logger.info("MongoDB connected")

    logger.info("Loading Mistral model (this may take a few minutes)...")
    model_service.load_model()

    yield  # App is running

    logger.info("Shutting down...")
    disconnect_db()


app = FastAPI(
    title="SEO Blog Generation Engine",
    description="AI-powered blog generation with SEO analysis",
    version="1.0.0",
    lifespan=lifespan
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(blog.router, prefix="/api/v1", tags=["Blog"])


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model": model_service.health(),
        "environment": settings.APP_ENV
    }