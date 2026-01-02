import os
import uuid
import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer

# Use relative path for portability
PERSIST_PATH = os.path.join(os.getcwd(), "chroma_db")

print("Loading SentenceTransformer model...")
model = SentenceTransformer("BAAI/bge-base-en-v1.5")
print("Model loaded.")

print("Initializing ChromaDB client...")
client = chromadb.PersistentClient(path=PERSIST_PATH)
print("ChromaDB client initialized.")

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
    
    # Check if files exist
    if not os.path.exists("founders_cleaned.csv") or not os.path.exists("investors_cleaned.csv"):
        return "CSV files not found. Skipping ingestion."

    founders_df = pd.read_csv("founders_cleaned.csv")
    investors_df = pd.read_csv("investors_cleaned.csv")

    founder_docs, founder_meta, founder_ids = [], [], []
    for _, row in founders_df.iterrows():
        text = founder_row_to_text(row)
        if not text.strip():
            continue
        founder_docs.append(text)
        
        # safely get fields for metadata
        meta = {
            "role": "founder",
            "company": row.get("company"),
            "name": row.get("founder_name"),
            "funding_round": row.get("funding_round"),
            "primary_domain": row.get("domain"), # Mapping domain to primary_domain for consistency
            "secondary_domain": row.get("secondary_domain"),
            "website": row.get("website"),
            "linkedin_url": row.get("linkedin_url"),
            "location": row.get("location"),
            "is_active": True # Founders assumed active or column not present
        }
        founder_meta.append(clean_metadata(meta))
        founder_ids.append(str(uuid.uuid4()))

    investor_docs, investor_meta, investor_ids = [], [], []
    for _, row in investors_df.iterrows():
        text = investor_row_to_text(row)
        if not text.strip():
            continue
        investor_docs.append(text)
        
        meta = {
            "role": "investor",
            "name": row.get("name"),
            "firm_name": row.get("firm_name"),
            "domain": row.get("primary_domain"), # Keep for backward compat
            "primary_domain": row.get("primary_domain"),
            "secondary_domain": row.get("secondary_domain"),
            "investment_stage_pref": row.get("investment_stage_pref"),
            "past_investments": row.get("past_investments"),
            "website": row.get("website"),
            "linkedin_url": row.get("linkedin_url"),
            "is_active": bool(row.get("is_active")) if pd.notna(row.get("is_active")) else False
        }
        investor_meta.append(clean_metadata(meta))
        investor_ids.append(str(uuid.uuid4()))

    # Batch add if list is large, but for this size it's fine
    if founder_docs:
        founder_emb = model.encode(founder_docs, normalize_embeddings=True)
        founder_collection.add(
            documents=founder_docs,
            embeddings=founder_emb.tolist(),
            metadatas=founder_meta,
            ids=founder_ids
        )

    if investor_docs:
        investor_emb = model.encode(investor_docs, normalize_embeddings=True)
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
