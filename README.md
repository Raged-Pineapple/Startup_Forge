# StartUp Forge

A decentralized platform for startup-investor matching and secure communication.

## System Architecture

The application consists of 5 main services:

| Service | Port | Description | Tech Stack |
| :--- | :--- | :--- | :--- |
| **Frontend** | `5173` | Main User Interface | React, Vite, Shadcn UI |
| **Backend** | `3000` | Database & API Gatekeeper | Node.js, Express, PostgreSQL |
| **Gun Server** | `8765` | Decentralized Chat Relay | Node.js, Gun.js |
| **RAG Backend** | `8000` | AI Chat & Semantic Search | Python, FastAPI, Mistral AI |
| **Prediction** | `8002` | Matches & Growth Prediction | Python, FastAPI, XGBoost |

---

## Prerequisites

1.  **Node.js**: v18+
2.  **Python**: 3.10+
3.  **PostgreSQL**: Running locally or via Docker.
4.  **Virtual Environment**: Located at `d:\one_day_bfr\venv`.

---

## 1. Setup & Installation

### Python Services (RAG & Prediction)
The project shares a common virtual environment. Ensure dependencies are installed for both services.

```powershell
# Install RAG Backend Dependencies
cd rag_backend
& "d:\one_day_bfr\venv\Scripts\python.exe" -m pip install -r requirements.txt

# Install Prediction Backend Dependencies
cd ../growth_predict/models/investor_backend
& "d:\one_day_bfr\venv\Scripts\python.exe" -m pip install -r requirements.txt
```

### Node.js Services (Backend, Gun, Frontend)

```powershell
# Root Backend
cd ../../../backend
npm install

# Gun Relay
cd ../gun_server
npm install

# Frontend
cd ../frontend
npm install
```

---

## 2. Running the Application

You need to run these commands in **separate terminal windows**.

### Terminal 1: Main Backend
```powershell
cd backend
node server.js
```
*Runs on http://localhost:3000*

### Terminal 2: Gun Relay (Chat)
```powershell
cd gun_server
node gun.js
```
*Runs on http://localhost:8765*

### Terminal 3: RAG Backend (AI Chat)
Make sure you have `MISTRAL_API_KEY` in `rag_backend/.env`.
```powershell
cd rag_backend
& "d:\one_day_bfr\venv\Scripts\python.exe" -m uvicorn app:app --reload
```
*Runs on http://localhost:8000*

### Terminal 4: Prediction Service (StartUp Matching)
```powershell
cd growth_predict/models/investor_backend
& "d:\one_day_bfr\venv\Scripts\python.exe" -m uvicorn app:app --host 0.0.0.0 --port 8002
```
*Runs on http://localhost:8002*

### Terminal 5: Frontend
```powershell
cd frontend
npm run dev
```
*Runs on http://localhost:5173* (or similar)

---

## 3. Environment Variables

### `rag_backend/.env`
```
MISTRAL_API_KEY=your_key_here
```

### `backend/.env` (If applicable)
Ensure database credentials vary by setup, usually:
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=startupforge_db
DB_PASSWORD=StrongPassword123
DB_PORT=5432
```
