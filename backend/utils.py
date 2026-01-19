"""
Utility functions for app state management and data transformation.
"""
from databricks.sdk.service.apps import AppDeploymentState
import logging

logger = logging.getLogger(__name__)


def determine_app_state(app) -> str:
    """
    Determine the current state of a Databricks app based on deployment status.
    
    Args:
        app: A Databricks app object with active_deployment attribute
        
    Returns:
        State string: 'on', 'off', or 'loading'
    """
    try:
        if app.active_deployment and app.active_deployment.status:
            state = app.active_deployment.status.state
            
            if state == AppDeploymentState.SUCCEEDED:
                return "on"
            elif state in [
                AppDeploymentState.PENDING,
                AppDeploymentState.RUNNING
            ]:
                return "loading"
        
        return "off"
    except Exception as e:
        logger.warning(f"Error determining app state: {e}")
        return "off"


def serialize_deployment_state(app):
    """
    Serialize the deployment state to a string value.
    
    Args:
        app: A Databricks app object
        
    Returns:
        State string value or None
    """
    try:
        if app.active_deployment and app.active_deployment.status:
            state = app.active_deployment.status.state
            # Handle both enum and string values
            if hasattr(state, 'value'):
                return state.value
            return str(state)
        return None
    except Exception as e:
        logger.warning(f"Error serializing deployment state: {e}")
        return None


def app_to_dict(app) -> dict:
    """
    Convert a Databricks app object to a dictionary.
    
    Args:
        app: A Databricks app object
        
    Returns:
        Dictionary representation of the app
    """
    deployment_state = serialize_deployment_state(app)
    
    return {
        "name": app.name,
        "description": getattr(app, 'description', None),
        "url": getattr(app, 'url', None),
        "active_deployment": {
            "status": {
                "state": deployment_state
            }
        } if app.active_deployment else None
    }

