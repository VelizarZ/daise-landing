# Data & AI Demo Catalog

This is a full-stack application with a Next.js frontend and FastAPI backend for managing Databricks apps. The frontend provides a user-friendly interface, while the backend uses the Databricks Python SDK to interact with Databricks workspaces.

## Architecture

- **Frontend**: Next.js 16 with NextAuth for authentication
- **Backend**: FastAPI with Databricks Python SDK
- **Authentication**: AWS Cognito via NextAuth

## Prerequisites

- Node.js 18+
- Python 3.9+
- AWS Cognito configured
- Databricks workspace access

## Setup

### 1. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment and install dependencies:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:

```env
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
ALLOWED_ORIGINS=http://localhost:3000
```

Start the FastAPI server:

```bash
# Using the script
chmod +x run.sh
./run.sh

# Or directly
uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

### 2. Frontend Setup

In the root directory, create a `.env.local` file:

```env
# NextAuth Configuration
COGNITO_CLIENT_ID=your_cognito_client_id
COGNITO_CLIENT_SECRET=your_cognito_client_secret
COGNITO_ISSUER=your_cognito_issuer_url

# FastAPI Backend URL
FASTAPI_BACKEND_URL=http://localhost:8000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
daise-landing/
├── app/                    # Next.js frontend
│   ├── api/               # API routes (proxies to FastAPI)
│   ├── components/        # React components
│   └── types/            # TypeScript types
├── backend/               # FastAPI backend
│   ├── main.py          # FastAPI application
│   └── requirements.txt  # Python dependencies
└── public/               # Static assets
```

## API Endpoints

### Backend (FastAPI)
- `GET /health` - Health check
- `GET /api/apps` - List all Databricks apps
- `POST /api/apps/{app_name}/start` - Start an app
- `GET /api/apps/{app_name}/status` - Get app status

### Frontend (Next.js API Routes)
- `GET /api/databricks/apps` - Proxy to FastAPI
- `POST /api/databricks/apps/[appName]/start` - Proxy to FastAPI
- `GET /api/databricks/apps/[appName]/status` - Proxy to FastAPI

## Features

- **Authentication**: Secure OAuth2 authentication with AWS Cognito
- **App Management**: List, start, and monitor Databricks apps
- **Real-time Status**: Automatic polling for app deployment status
- **Responsive UI**: Modern, mobile-friendly interface

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
