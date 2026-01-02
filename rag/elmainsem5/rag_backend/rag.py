import os
import uuid
import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer

PERSIST_PATH = r"C:\Users\sushm\OneDrive\Desktop\llm_engineering-main\startup_forge\chroma_store"

model = SentenceTransformer("BAAI/bge-base-en-v1.5")

client = chromadb.PersistentClient(path=PERSIST_PATH)

founder_collection = client.get_or_create_collection(
    name="founders_collection",
    metadata={"hnsw:space": "cosine"}
)

investor_collection = client.get_or_create_collection(
    name="investors_collection",
    metadata={"hnsw:space": "cosine"}
)


# ---------- Helpers ----------
def clean_metadata(d):
    return {k: v for k, v in d.items() if v is not None and v == v}


def founder_row_to_text(row):
    parts = []
    if pd.notna(row.get("company")):
        parts.append(f"Company: {row['company']}.")
    if pd.notna(row.get("founder_name")):
        parts.append(f"Founder: {row['founder_name']}.")
    if pd.notna(row.get("funding_round")):
        parts.append(f"Funding round: {row['funding_round']}.")
    return " ".join(parts)


def investor_row_to_text(row):
    parts = []
    if pd.notna(row.get("name")):
        parts.append(f"Investor name: {row['name']}.")
    if pd.notna(row.get("firm_name")):
        parts.append(f"Firm: {row['firm_name']}.")
    if pd.notna(row.get("investment_stage_pref")):
        parts.append(f"Preferred stage: {row['investment_stage_pref']}.")
    if pd.notna(row.get("primary_domain")):
        parts.append(f"Domain: {row['primary_domain']}.")
    return " ".join(parts)


# ---------- Ingest (run once) ----------
def ingest_data():
    if founder_collection.count() > 0:
        return "Already ingested"

    founders_df = pd.read_csv("founders_cleaned.csv")
    investors_df = pd.read_csv("investors_cleaned.csv")

    founder_docs, founder_meta, founder_ids = [], [], []
    for _, row in founders_df.iterrows():
        text = founder_row_to_text(row)
        if not text.strip():
            continue
        founder_docs.append(text)
        founder_meta.append(clean_metadata({"role": "founder"}))
        founder_ids.append(str(uuid.uuid4()))

    investor_docs, investor_meta, investor_ids = [], [], []
    for _, row in investors_df.iterrows():
        text = investor_row_to_text(row)
        if not text.strip():
            continue
        investor_docs.append(text)
        investor_meta.append(clean_metadata({"role": "investor"}))
        investor_ids.append(str(uuid.uuid4()))

    founder_emb = model.encode(founder_docs, normalize_embeddings=True)
    investor_emb = model.encode(investor_docs, normalize_embeddings=True)

    founder_collection.add(
        documents=founder_docs,
        embeddings=founder_emb.tolist(),
        metadatas=founder_meta,
        ids=founder_ids
    )

    investor_collection.add(
        documents=investor_docs,
        embeddings=investor_emb.tolist(),
        metadatas=investor_meta,
        ids=investor_ids
    )

    return "Ingestion complete"


# ---------- Query ----------
def query_founders(query: str, k: int = 5):
    q_emb = model.encode([query], normalize_embeddings=True)
    return founder_collection.query(
        query_embeddings=q_emb.tolist(),
        n_results=k
    )


def query_investors(query: str, k: int = 5):
    q_emb = model.encode([query], normalize_embeddings=True)
    return investor_collection.query(
        query_embeddings=q_emb.tolist(),
        n_results=k
    )
