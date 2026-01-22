import os
import uuid
import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()

# ---------- Mistral Init ----------
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    print("❌ Error: MISTRAL_API_KEY is not set in environment variables.")
else:
    print(f"✅ MISTRAL_API_KEY loaded (len={len(MISTRAL_API_KEY)}). Starts with: {MISTRAL_API_KEY[:4]}...")

MISTRAL_CLIENT = Mistral(api_key=MISTRAL_API_KEY)
MISTRAL_MODEL = "mistral-small-latest"

PERSIST_PATH = os.path.join(os.getcwd(), "chroma_store")

# Initialize Embedding Model
# Switched to MiniLM to save memory (Render Free Tier < 512MB)
model = SentenceTransformer("all-MiniLM-L6-v2")

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

    # 3. Call Mistral
    try:
        response = MISTRAL_CLIENT.chat.complete(
            model=MISTRAL_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error contacting AI Assistant: {str(e)}"


def generate_chat_reply(history: list, user_context: str):
    """
    history: List of {"sender": "Me"|"Them", "content": "..."}
    user_context: String describing the current user (e.g. "Role: Founder. Name: Alex Rivera")
    """
    
    # 1. Retrieve MY details (The User's Data) via RAG
    # We search for the user's own context to get their company info, valuation, etc.
    my_data_query = f"Details about {user_context}"
    my_data_res = query_founders(my_data_query, k=1) # Get top 1 match for myself
    
    my_facts = "No specific data found."
    if my_data_res["documents"] and my_data_res["documents"][0]:
        my_facts = my_data_res["documents"][0][0] # Primary match string

    # 1. Format History
    conversation_text = ""
    for msg in history[-10:]: # Look at last 10 messages
        sender = "Me" if msg.get("isMe") else "Them"
        conversation_text += f"{sender}: {msg.get('content')}\n"

    # 2. Build Prompt
    system_prompt = (
        "You are an intelligent executive assistant for a Startup Founder. "
        "Your goal is to draft a clean, crisp, and high-impact reply based on the conversation. "
        "STRICT RULES:\n"
        "1. USE DATA: You have access to the user's company details below ('My Company Data'). Use these EXACT numbers (Valuation, Revenue, Growth). "
        "   NEVER use placeholders like '[Insert Value]' or '[X]'. If the data is missing, omit that specific point rather than guessing.\n"
        "2. BE CRISP: Use short sentences. Use bullet points for stats/lists. No fluff. No generic intros.\n"
        "3. POINT-WISE: If specific questions were asked (e.g. 'What's your valuation?'), answer them directly with the number.\n"
        "4. TONE: Confident, professional, Silicon Valley style."
    )

    user_prompt = (
        f"My Company Data (Use this for facts): {my_facts}\n"
        f"Context: {user_context}\n\n"
        f"Conversation History:\n{conversation_text}\n\n"
        "Draft a reply for me (Me):"
    )

    # 3. Call Mistral
    try:
        response = MISTRAL_CLIENT.chat.complete(
            model=MISTRAL_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error generating reply: {str(e)}"
