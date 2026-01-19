"""
Configuration module for the FastAPI backend.
Handles environment variables and application settings.
"""
import os
from typing import List


class Settings:
    """Application settings loaded from environment variables."""
    
    # Databricks configuration
    DATABRICKS_HOST: str = os.getenv("DATABRICKS_HOST", "")
    
    # CORS configuration
    ALLOWED_ORIGINS: List[str] = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:3000"
    ).split(",")
    
    # Server configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    @classmethod
    def validate(cls) -> None:
        """Validate that required settings are present."""
        if not cls.DATABRICKS_HOST:
            raise ValueError("DATABRICKS_HOST environment variable is required")


# Create a singleton instance
settings = Settings()
