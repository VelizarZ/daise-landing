# Daise Landing

Databricks Apps Catalog - A full-stack application for managing and launching Databricks apps.

## How to Run

1. Set up environment variables (see below)
2. Run the application:

```bash
docker compose up --build
```

The backend will be available at `http://localhost:8000`  
The frontend will be available at `http://localhost:3000`

## Environment Variables

### Frontend

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
COGNITO_CLIENT_ID=your_cognito_client_id
COGNITO_CLIENT_SECRET=your_cognito_client_secret
COGNITO_ISSUER=your_cognito_issuer_url
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Backend


```env
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
ALLOWED_ORIGINS=http://localhost:3000
```
