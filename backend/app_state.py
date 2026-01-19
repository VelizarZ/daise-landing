from typing import Literal

from databricks.sdk.service.apps import App, AppDeploymentState, ComputeState
from enums import AppState


def state_management(app: App) -> Literal['off', 'loading', 'on']:
    try:
        if app.compute_status.state in [ComputeState.STOPPED, ComputeState.STOPPING]:
            state = AppState.OFF
        elif (
            app.compute_status.state == ComputeState.STARTING
            or app.active_deployment.status.state == AppDeploymentState.IN_PROGRESS
        ):
            state = AppState.LOADING
        elif app.active_deployment.status.state == AppDeploymentState.SUCCEEDED:
            state = AppState.ON
    except AttributeError:
        state = AppState.OFF

    return state
