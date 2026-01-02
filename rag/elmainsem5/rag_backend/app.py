from fastapi import FastAPI
from pydantic import BaseModel
from rag import ingest_data, query_founders, query_investors

app = FastAPI(title="Startup Forge RAG Backend")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Models ----------
class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


# ---------- Startup ----------
@app.on_event("startup")
def load_data():
    ingest_data()


# ---------- APIs ----------
@app.post("/search/founders")
def search_founders(req: QueryRequest):
    res = query_founders(req.query, req.top_k)
    return {
        "query": req.query,
        "results": res["documents"][0]
    }


@app.post("/search/investors")
def search_investors(req: QueryRequest):
    res = query_investors(req.query, req.top_k)
    return {
        "query": req.query,
        "results": res["documents"][0]
    }
