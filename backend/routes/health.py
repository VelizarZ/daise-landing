"""
Health check endpoint.
"""
from fastapi import APIRouter
from schemas import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint to verify the API is running.
    
    Returns:
        Health status response
    """
    return HealthResponse(status="healthy")
