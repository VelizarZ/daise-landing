# FastAPI Backend for Databricks Apps

A modular FastAPI backend that provides an API layer between the Next.js frontend and the Databricks Python SDK.

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration and settings
├── schemas.py           # Pydantic models for requests/responses
├── dependencies.py       # FastAPI dependencies (auth, clients)
├── utils.py             # Utility functions
├── routes/              # Route modules
│   ├── __init__.py
│   ├── health.py        # Health check endpoint
│   └── apps.py          # Apps management endpoints
├── requirements.txt     # Python dependencies
└── README.md            # This file
```

## Setup

### 1. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Required
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com

# Optional (with defaults)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO
```

## Running the Server

### Development Mode

```bash
uvicorn main:app --reload --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Using Python Directly

```bash
python main.py
```

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Apps
- `GET /api/apps` - List all Databricks apps
- `POST /api/apps/{app_name}/start` - Start a specific app
- `GET /api/apps/{app_name}/status` - Get status of a specific app

## Authentication

All endpoints (except `/health`) require an `Authorization` header with a Bearer token:

```
Authorization: Bearer <your_databricks_token>
```

The token should be the OIDC `id_token` from your Cognito authentication.

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Architecture

### Modular Design

The backend is organized into separate modules:

- **config.py**: Centralized configuration management
- **schemas.py**: Pydantic models for type safety and validation
- **dependencies.py**: Reusable FastAPI dependencies
- **utils.py**: Pure utility functions
- **routes/**: Separate route modules for different endpoints

### Error Handling

All routes include proper error handling and logging. Errors are returned as JSON with appropriate HTTP status codes.

### Logging

Logging is configured via the `LOG_LEVEL` environment variable. Default is `INFO`.

## Development

### Adding New Endpoints

1. Create a new route module in `routes/` if needed
2. Define schemas in `schemas.py`
3. Add dependencies in `dependencies.py` if needed
4. Include the router in `main.py`

### Testing

You can test the API using:
- Swagger UI at `/docs`
- curl commands
- Postman or similar tools

Example:
```bash
curl -X GET "http://localhost:8000/api/apps" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
