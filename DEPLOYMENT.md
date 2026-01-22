# Deployment Guide

The entire system is containerized using Docker. This allows you to run all services with a single command.

## Prerequisites
- Docker Desktop installed.

## Services Overview

| Service | Container Name | Local Port |
| :--- | :--- | :--- |
| **Database** | `startupforge-postgres` | `5432` |
| **Backend** | `startupforge-backend` | `3000` |
| **Gun Relay** | `startupforge-gun` | `8765` |
| **RAG AI** | `startupforge-rag` | `8000` |
| **Prediction** | `startupforge-prediction` | `8002` |
| **Frontend** | `startupforge-frontend` | `5173` |

## How to Run

1.  **Environment Variables**:
    Ensure you have a `.env` file in the root directory (or set in your shell) with your AI API key:
    ```
    MISTRAL_API_KEY=your_actual_key_here
    ```

2.  **Build and Start**:
    ```bash
    docker-compose up --build
    ```

3.  **Access the App**:
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## Notes
- The database volume `postgres_data` persists data even if containers are stopped.
- The `rag_backend` container expects `MISTRAL_API_KEY` to be available. You can create a `.env` in the same folder as `docker-compose.yml` to set it automatically.
