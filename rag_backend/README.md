# RAG Backend (Mistral AI)

This service provides RAG (Retrieval-Augmented Generation) capabilities using Mistral AI.

## Prerequisites

1.  **Virtual Environment**: Ensure you are using the project's virtual environment located at `d:\one_day_bfr\venv`.
2.  **Mistral API Key**: You must have a valid `MISTRAL_API_KEY` in the `.env` file.

## Setup

1.  **Install Dependencies**:
    ```powershell
    # Activate venv first or use full path
    & "d:\one_day_bfr\venv\Scripts\python.exe" -m pip install -r requirements.txt
    ```

2.  **Environment Variables**:
    Create a `.env` file in this directory with:
    ```
    MISTRAL_API_KEY=your_key_here
    ```

## Running the Server

To start the server, use the Python executable from the virtual environment:

```powershell
& "d:\one_day_bfr\venv\Scripts\python.exe" -m uvicorn app:app --reload
```

The server will start at `http://127.0.0.1:8000`.

## API Endpoints

-   `POST /chat`: Chat with the AI using RAG context.
-   `POST /search/founders`: Semantic search for founders.
-   `POST /search/investors`: Semantic search for investors.
