"""
Pydantic schemas for request/response models.
"""
from typing import Optional
from pydantic import BaseModel


class AppResponse(BaseModel):
    """Response model for a Databricks app."""
    name: str
    description: Optional[str] = None
    url: Optional[str] = None
    active_deployment: Optional[dict] = None
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "name": "my-app",
                "description": "My Databricks app",
                "url": "https://my-app.cloud.databricks.com",
                "active_deployment": {
                    "status": {
                        "state": "SUCCEEDED"
                    }
                }
            }
        }


class AppsListResponse(BaseModel):
    """Response model for list of apps."""
    apps: list[AppResponse]
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "apps": [
                    {
                        "name": "app-1",
                        "description": "First app",
                        "url": "https://app-1.cloud.databricks.com",
                        "active_deployment": None
                    }
                ]
            }
        }


class StartAppResponse(BaseModel):
    """Response model for starting an app."""
    success: bool
    message: str
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "App my-app is starting"
            }
        }


class AppStatusResponse(BaseModel):
    """Response model for app status."""
    app: AppResponse
    state: str  # 'off', 'on', 'loading'
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "app": {
                    "name": "my-app",
                    "description": "My app",
                    "url": "https://my-app.cloud.databricks.com",
                    "active_deployment": {
                        "status": {
                            "state": "SUCCEEDED"
                        }
                    }
                },
                "state": "on"
            }
        }


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "status": "healthy"
            }
        }
