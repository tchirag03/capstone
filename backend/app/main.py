"""
FastAPI application entry point.
"""
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.mongodb import connect_db, close_db
from app.core.redis_client import connect_redis, close_redis
from app.db.queries.index_setup import ensure_indexes
from app.db.services.queue_service import start_worker
from app.services.ocr_service import init_ocr_service
from app.services.structuring_service import init_structuring_service
from app.services.slm_service import init_slm_service

from app.routers import (
    evaluations,
    sheets,
    ocr,
    structuring,
    slm,
    results,
    export,
    settings as settings_router,
)
from app.routers import scripts, evaluation_jobs, analytics, performance


# ---------- Lifespan ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    await connect_redis()
    await ensure_indexes()

    init_ocr_service()   # Mistral OCR client (runs once)
    init_structuring_service()
    init_slm_service()   # Load Qwen2.5-0.5B (runs once)
    worker_task = asyncio.create_task(start_worker())
    yield
    # Shutdown
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass
    await close_redis()
    await close_db()


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Modular NoSQL-Based Evaluation Data Management System",
    lifespan=lifespan,
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Existing routers ----------
app.include_router(evaluations.router, prefix=settings.api_prefix)
app.include_router(sheets.router, prefix=settings.api_prefix)
app.include_router(ocr.router, prefix=settings.api_prefix)
app.include_router(structuring.router, prefix=settings.api_prefix)
app.include_router(slm.router, prefix=settings.api_prefix)
app.include_router(results.router, prefix=settings.api_prefix)
app.include_router(export.router, prefix=settings.api_prefix)
app.include_router(settings_router.router, prefix=settings.api_prefix)

# ---------- New routers ----------
app.include_router(scripts.router, prefix=settings.api_prefix)
app.include_router(evaluation_jobs.router, prefix=settings.api_prefix)
app.include_router(analytics.router, prefix=settings.api_prefix)
app.include_router(performance.router, prefix=settings.api_prefix)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Sustainable AI Assessment Platform API",
        "version": settings.version,
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
