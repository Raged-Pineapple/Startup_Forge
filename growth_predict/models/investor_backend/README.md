# Prediction Backend (Port 8002)

This service powers the "Find Investors" and "Growth Prediction" features.

## Prerequisites

1.  **Virtual Environment**: Use `d:\one_day_bfr\venv`.

## Setup

1.  **Navigate directly**:
    ```powershell
    cd growth_predict/models/investor_backend
    ```

2.  **Install Dependencies**:
    ```powershell
    & "d:\one_day_bfr\venv\Scripts\python.exe" -m pip install -r requirements.txt
    ```

## Running the Server

Run the server on port 8002:

```powershell
& "d:\one_day_bfr\venv\Scripts\python.exe" -m uvicorn app:app --host 0.0.0.0 --port 8002
```

## API Endpoints

-   `POST /predict`: Predict startup growth.
-   `POST /match`: Find matching investors.
