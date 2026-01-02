from fastapi import FastAPI
from pydantic import BaseModel
from rag import ingest_data, query_founders, query_investors
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Startup Forge RAG Backend")

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
    # Rewrite result structure to be friendlier
    # res["documents"][0] is a list of strings
    # res["metadatas"][0] is a list of dicts
    # res["ids"][0] is a list of ids
    
    hits = []
    if res and res.get("documents"):
        docs = res["documents"][0]
        metas = res["metadatas"][0]
        ids = res["ids"][0]
        
        for i in range(len(docs)):
            hits.append({
                "id": ids[i],
                "text": docs[i],
                "metadata": metas[i] if metas else {}
            })
            
    return {
        "query": req.query,
        "results": hits
    }


@app.post("/search/investors")
def search_investors(req: QueryRequest):
    res = query_investors(req.query, req.top_k)
    
    hits = []
    if res and res.get("documents"):
        docs = res["documents"][0]
        metas = res["metadatas"][0]
        ids = res["ids"][0]
        
        for i in range(len(docs)):
            hits.append({
                "id": ids[i],
                "text": docs[i],
                "metadata": metas[i] if metas else {}
            })

    return {
        "query": req.query,
        "results": hits
    }
