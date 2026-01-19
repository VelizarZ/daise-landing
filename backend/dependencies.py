from typing import Optional
from fastapi import Header, HTTPException
from databricks.sdk import WorkspaceClient, oidc
from databricks.sdk.core import (
    Config,
    CredentialsProvider,
    credentials_strategy,
    oidc_credentials_provider,
)

from config import settings


def _extract_bearer(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing/invalid Authorization header")
    return authorization.removeprefix("Bearer ").strip()


class HeaderIdTokenSource(oidc.IdTokenSource):
    def __init__(self, jwt_token: str):
        self._jwt_token = jwt_token

    def id_token(self) -> oidc.IdToken:
        # This is your IdP JWT (Cognito token)
        return oidc.IdToken(jwt=self._jwt_token)

def get_authenticated_client(authorization: Optional[str] = Header(None)) -> WorkspaceClient:
    idp_jwt = _extract_bearer(authorization)

    @credentials_strategy('session-state-oids', '')
    def session_state_oids_strategy(cfg: Config) -> CredentialsProvider:
        return oidc_credentials_provider(cfg, HeaderIdTokenSource(idp_jwt))

    cfg = Config(
        host=settings.DATABRICKS_HOST,
        # If you are using *service principal federation policy*, you may need client_id:
        # client_id=settings.DATABRICKS_CLIENT_ID,
        credentials_strategy=session_state_oids_strategy,
    )

    return WorkspaceClient(config=cfg)
