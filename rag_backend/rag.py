import os
import uuid
import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# ---------- OpenAI / Ollama Init ----------
# Use local Ollama instance acting as OpenAI API
LLM_CLIENT = OpenAI(
    base_url=os.getenv("OPENAI_BASE_URL", "http://localhost:11434/v1"),
    api_key=os.getenv("OPENAI_API_KEY", "ollama")
)

PERSIST_PATH = os.path.join(os.getcwd(), "chroma_store")

# Initialize Embedding Model
model = SentenceTransformer("BAAI/bge-base-en-v1.5")

# Initialize ChromaDB
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
    if pd.notna(row.get("name")):
        parts.append(f"Founder: {row['name']}.")
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
    print(f"Checking ingestion for store at: {PERSIST_PATH}")
    if founder_collection.count() > 0:
        print(f"Already ingested. Founder Collection Count: {founder_collection.count()}")
        return "Already ingested"

    print("Starting Ingestion...")
    try:
        founders_df = pd.read_csv("founders_cleaned.csv")
        investors_df = pd.read_csv("investors_cleaned.csv")

        founder_docs, founder_meta, founder_ids = [], [], []
        for _, row in founders_df.iterrows():
            text = founder_row_to_text(row)
            if not text.strip():
                continue
            founder_docs.append(text)
            founder_meta.append(clean_metadata({"role": "founder", "id": str(row["id"])}))
            founder_ids.append(str(uuid.uuid4()))

        investor_docs, investor_meta, investor_ids = [], [], []
        for _, row in investors_df.iterrows():
            text = investor_row_to_text(row)
            if not text.strip():
                continue
            investor_docs.append(text)
            investor_meta.append(clean_metadata({"role": "investor", "id": str(row["id"])}))
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
    except Exception as e:
        print(f"Ingestion failed: {e}")
        return f"Ingestion failed: {e}"


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

def chat_with_rag(query: str):
    # 1. Retrieve Context
    f_res = query_founders(query, k=3)
    i_res = query_investors(query, k=3)

    context_lines = []
    
    if f_res["documents"] and f_res["documents"][0]:
        context_lines.append("--- FOUNDERS / STARTUPS ---")
        for doc in f_res["documents"][0]:
            context_lines.append(doc)
            
    if i_res["documents"] and i_res["documents"][0]:
        context_lines.append("\n--- INVESTORS ---")
        for doc in i_res["documents"][0]:
            context_lines.append(doc)
            
    context_str = "\n".join(context_lines)

    # 2. Build Prompt
    system_prompt = (
        "You are an AI Investment Assistant for Startup Forge. "
        "Your responses must be strictly professional, composed, and concise. "
        "Do NOT use casual greetings (e.g., 'Hi', 'Hello') or introduction paragraphs. "
        "Go straight to the point. Use bullet points for facts. "
        "Answer the user's question about founders, startups, and investors using the provided context."
    )
    
    user_prompt = f"Context:\n{context_str}\n\nQuestion: {query}"

    # 3. Call Llama 3.2 via Ollama (OpenAI compatible)
    try:
        response = LLM_CLIENT.chat.completions.create(
            model="llama3.2",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error contacting AI Assistant: {str(e)}"
