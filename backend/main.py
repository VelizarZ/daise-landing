"""
Main FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from config import settings
from routes import health, apps
import uvicorn

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Validate settings on startup
try:
    settings.validate()
except ValueError as e:
    logger.error(f"Configuration error: {e}")
    raise

# Create FastAPI app
app = FastAPI(
    title="Databricks Apps API",
    version="1.0.0",
    description="API for managing Databricks apps using the Databricks Python SDK"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(apps.router)


@app.on_event("startup")
async def startup_event():
    """Log startup information."""
    logger.info("Starting Databricks Apps API")
    logger.info(f"Databricks Host: {settings.DATABRICKS_HOST}")
    logger.info(f"Allowed Origins: {settings.ALLOWED_ORIGINS}")


@app.on_event("shutdown")
async def shutdown_event():
    """Log shutdown information."""
    logger.info("Shutting down Databricks Apps API")


if __name__ == "__main__":
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        log_level=settings.LOG_LEVEL.lower()
    )
