"""
Routes for Databricks apps management.
"""
from fastapi import APIRouter, HTTPException, Depends
from databricks.sdk import WorkspaceClient
import logging

from schemas import AppsListResponse, AppResponse, StartAppResponse, AppStatusResponse
from dependencies import get_authenticated_client
from utils import determine_app_state, app_to_dict

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/databricks/apps", tags=["apps"])


@router.get("", response_model=AppsListResponse)
async def list_apps(
    client: WorkspaceClient = Depends(get_authenticated_client)
) -> AppsListResponse:
    """
    Get list of all Databricks apps.
    
    Args:
        client: Authenticated Databricks WorkspaceClient
        
    Returns:
        List of all apps
        
    Raises:
        HTTPException: If listing apps fails
    """
    try:
        apps = []
        for app in client.apps.list():
            app_dict = app_to_dict(app)
            apps.append(AppResponse(**app_dict))
        
        return AppsListResponse(apps=apps)
    except Exception as e:
        logger.error(f"Error listing apps: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list apps: {str(e)}"
        )


@router.post("/{app_name}/start", response_model=StartAppResponse)
async def start_app(
    app_name: str,
    client: WorkspaceClient = Depends(get_authenticated_client)
) -> StartAppResponse:
    """
    Start a Databricks app.
    
    Args:
        app_name: Name of the app to start
        client: Authenticated Databricks WorkspaceClient
        
    Returns:
        Success response with message
        
    Raises:
        HTTPException: If starting the app fails
    """
    try:
        client.apps.start(app_name)
        logger.info(f"App {app_name} started successfully")
        return StartAppResponse(
            success=True,
            message=f"App {app_name} is starting"
        )
    except Exception as e:
        logger.error(f"Error starting app {app_name}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start app: {str(e)}"
        )


@router.get("/{app_name}/status", response_model=AppStatusResponse)
async def get_app_status(
    app_name: str,
    client: WorkspaceClient = Depends(get_authenticated_client)
) -> AppStatusResponse:
    """
    Get the status of a specific Databricks app.
    
    Args:
        app_name: Name of the app to check
        client: Authenticated Databricks WorkspaceClient
        
    Returns:
        App status with current state
        
    Raises:
        HTTPException: If getting app status fails
    """
    try:
        app = client.apps.get(app_name)
        
        app_dict = app_to_dict(app)
        app_response = AppResponse(**app_dict)
        state = determine_app_state(app)
        
        return AppStatusResponse(app=app_response, state=state)
    except Exception as e:
        logger.error(f"Error getting app status for {app_name}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get app status: {str(e)}"
        )
