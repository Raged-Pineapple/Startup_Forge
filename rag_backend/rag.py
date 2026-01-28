import os
import csv
import uuid
import math
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()

# ---------- Mistral Init ----------
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_CLIENT = Mistral(api_key=MISTRAL_API_KEY)
MISTRAL_MODEL = "mistral-small-latest"

# ---------- In-Memory Store ----------
# Structure: [ { "id": str, "text": str, "embedding": List[float], "metadata": dict } ]
FOUNDER_STORE = []
INVESTOR_STORE = []

# ---------- Helpers ----------
def get_embedding(text):
    if not text or not text.strip():
        return None
    try:
        resp = MISTRAL_CLIENT.embeddings.create(
            model="mistral-embed",
            inputs=[text]
        )
        return resp.data[0].embedding
    except Exception as e:
        print(f"Embedding error: {e}")
        return None

def cosine_similarity(v1, v2):
    if not v1 or not v2: return 0.0
    dot_product = sum(a * b for a, b in zip(v1, v2))
    magnitude1 = math.sqrt(sum(a * a for a in v1))
    magnitude2 = math.sqrt(sum(b * b for b in v2))
    if magnitude1 == 0 or magnitude2 == 0: return 0.0
    return dot_product / (magnitude1 * magnitude2)

def row_to_text(row, role):
    parts = []
    if role == "founder":
        if row.get("company"): parts.append(f"Company: {row['company']}.")
        if row.get("name"): parts.append(f"Founder: {row['name']}.")
        if row.get("funding_round"): parts.append(f"Funding round: {row['funding_round']}.")
    else:
        if row.get("name"): parts.append(f"Investor name: {row['name']}.")
        if row.get("firm_name"): parts.append(f"Firm: {row['firm_name']}.")
        if row.get("investment_stage_pref"): parts.append(f"Preferred stage: {row['investment_stage_pref']}.")
        if row.get("primary_domain"): parts.append(f"Domain: {row['primary_domain']}.")
    return " ".join(parts)

# ---------- Ingest ----------
def ingest_data():
    global FOUNDER_STORE, INVESTOR_STORE
    
    if len(FOUNDER_STORE) > 0:
        return "Already ingested"

    print("Starting Ultra-Lite Ingestion...")
    try:
        # Load Founders
        with open("founders_cleaned.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                text = row_to_text(row, "founder")
                if not text.strip(): continue
                emb = get_embedding(text)
                if emb:
                    FOUNDER_STORE.append({
                        "id": str(uuid.uuid4()),
                        "text": text,
                        "embedding": emb,
                        "metadata": row
                    })

        # Load Investors
        with open("investors_cleaned.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                text = row_to_text(row, "investor")
                if not text.strip(): continue
                emb = get_embedding(text)
                if emb:
                    INVESTOR_STORE.append({
                        "id": str(uuid.uuid4()),
                        "text": text,
                        "embedding": emb,
                        "metadata": row
                    })
        
        print(f"Ingested {len(FOUNDER_STORE)} founders and {len(INVESTOR_STORE)} investors.")
        return "Ingestion complete"
    except Exception as e:
        print(f"Ingestion failed: {e}")
        return f"Ingestion failed: {e}"

# ---------- Query ----------
def search_store(query, store, k=5):
    q_emb = get_embedding(query)
    if not q_emb: return {"documents": [], "metadatas": []}
    
    # Calculate scores
    scored = []
    for item in store:
        score = cosine_similarity(q_emb, item["embedding"])
        scored.append((score, item))
    
    # Sort and slice
    scored.sort(key=lambda x: x[0], reverse=True)
    top_k = scored[:k]
    
    # Format like ChromaDB result
    return {
        "documents": [[item["text"] for _, item in top_k]],
        "metadatas": [[item["metadata"] for _, item in top_k]]
    }

def query_founders(query: str, k: int = 5):
    return search_store(query, FOUNDER_STORE, k)

def query_investors(query: str, k: int = 5):
    return search_store(query, INVESTOR_STORE, k)

def chat_with_rag(query: str):
    f_res = query_founders(query, k=3)
    i_res = query_investors(query, k=3)
    
    context_lines = []
    if f_res["documents"] and f_res["documents"][0]:
        context_lines.append("--- FOUNDERS ---")
        context_lines.extend(f_res["documents"][0])
    if i_res["documents"] and i_res["documents"][0]:
        context_lines.append("--- INVESTORS ---")
        context_lines.extend(i_res["documents"][0])
        
    context_str = "\n".join(context_lines)
    
    system_prompt = (
        "You are an AI Investment Assistant. Professional, concise, data-driven."
    )
    user_prompt = f"Context:\n{context_str}\n\nQuestion: {query}"
    
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
        return f"Error: {e}"

def generate_chat_reply(history: list, user_context: str):
    # Retrieve My Data
    my_data_res = query_founders(f"Details about {user_context}", k=1)
    my_facts = my_data_res["documents"][0][0] if my_data_res["documents"][0] else "No data."
    
    conversation_text = ""
    for msg in history[-10:]:
        sender = "Me" if msg.get("isMe") else "Them"
        conversation_text += f"{sender}: {msg.get('content')}\n"
        
    system_prompt = (
        "Draft a professional executive reply. Use the provided company data for facts."
    )
    user_prompt = f"My Data: {my_facts}\nContext: {user_context}\nHistory:\n{conversation_text}\nDraft reply:"
    
    try:
        response = MISTRAL_CLIENT.chat.complete(
            model=MISTRAL_MODEL,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            temperature=0.2
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error: {e}"
