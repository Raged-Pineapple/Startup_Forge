import pandas as pd
import numpy as np
import joblib
import os
import ast
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

app = FastAPI()

# --- Global Variables ---
investors_df = None
match_model = None
safety_model = None
embedder = None
domain_embeddings = None
mlb_stages = None
stage_features = None

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INVESTORS_CSV = os.path.join(BASE_DIR, "investors_cleaned.csv")
MATCH_MODEL_PATH = os.path.join(BASE_DIR, "investor_match_model.pkl")
SAFETY_MODEL_PATH = os.path.join(BASE_DIR, "investor_safety_model.pkl")
EMBEDDER_PATH = os.path.join(BASE_DIR, "text_embedder.pkl")

# --- Helper Functions ---
def safe_parse(x):
    if isinstance(x, list):
        return x
    if isinstance(x, str):
        try:
            parsed = ast.literal_eval(x)
            return parsed if isinstance(parsed, list) else []
        except:
            return []
    return []

def normalize_past_investments(x):
    if not isinstance(x, list):
        return []
    return [i for i in x if isinstance(i, dict)]

def compute_repeat_ratio(past_investments):
    if not past_investments:
        return 0.0
    companies = [inv.get("company_name") for inv in past_investments if "company_name" in inv]
    if not companies:
        return 0.0
    counts = pd.Series(companies).value_counts()
    return float(counts.max() / len(companies))

def activity_volatility_proxy(past_investments):
    if not past_investments:
        return 0.1
    years = [inv.get("year") for inv in past_investments if isinstance(inv.get("year"), (int, float))]
    size_vol = np.log1p(len(past_investments))
    recency_vol = np.std(years) if len(years) > 1 else 0.2
    return float(size_vol + recency_vol)

def growth_dependency_proxy(past_investments):
    if not past_investments:
        return 0.3
    companies = [inv.get("company_name") for inv in past_investments if isinstance(inv.get("company_name"), str)]
    if not companies:
        return 0.3
    freq = pd.Series(companies).value_counts(normalize=True)
    hhi = np.sum(freq ** 2)
    return float(max(hhi, 0.15))

def safety_label(score):
    if score > 0.7:
        return "Low Risk"
    elif score > 0.4:
        return "Moderate Risk"
    return "High Risk"

# --- Models ---
class StartupInput(BaseModel):
    sector: List[str]
    stage: str
    growth_rate: float

class InvestorMatch(BaseModel):
    name: str
    match_score: float
    match_probability: float
    safety_label: str
    growth_dependency: float
    activity_volatility: float
    confidence_score: float

class MatchResponse(BaseModel):
    matches: List[InvestorMatch]

@app.on_event("startup")
async def load_resources():
    global investors_df, match_model, safety_model, embedder, domain_embeddings, mlb_stages, stage_features
    
    print("Loading resources...")
    
    # Load Data
    try:
        investors_df = pd.read_csv(INVESTORS_CSV)
        print(f"Loaded {len(investors_df)} investors.")
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return

    # Load Models
    try:
        match_model = joblib.load(MATCH_MODEL_PATH)
        safety_model = joblib.load(SAFETY_MODEL_PATH)
        embedder = joblib.load(EMBEDDER_PATH)
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")
        return

    # Preprocessing
    print("Preprocessing investor data...")
    list_cols = ["secondary_domains", "investment_stage_pref", "tags", "past_investments"]
    for col in list_cols:
        investors_df[col] = investors_df[col].apply(safe_parse)
    
    investors_df["past_investments"] = investors_df["past_investments"].apply(normalize_past_investments)
    investors_df["domains"] = investors_df["secondary_domains"]
    investors_df["stage_pref"] = investors_df["investment_stage_pref"]
    investors_df["portfolio_size"] = investors_df["past_investments"].apply(len)
    
    investors_df["repeat_investment_ratio"] = investors_df["past_investments"].apply(compute_repeat_ratio)
    investors_df["activity_volatility"] = investors_df["past_investments"].apply(activity_volatility_proxy)
    investors_df["growth_dependency"] = investors_df["past_investments"].apply(growth_dependency_proxy)

    # Safety Score Calculation
    investors_df["safety_score"] = (
        1
        - 0.4 * investors_df["activity_volatility"].rank(pct=True)
        - 0.4 * investors_df["growth_dependency"].rank(pct=True)
        + 0.2 * investors_df["portfolio_size"].rank(pct=True)
    )
    investors_df["safety_score"] = investors_df["safety_score"].clip(0, 1)
    investors_df["safety_label"] = investors_df["safety_score"].apply(safety_label)

    # Embeddings and Features
    print("Generating embeddings (this may take a moment)...")
    investors_df["domain_text"] = investors_df["domains"].apply(lambda x: " ".join(x) if isinstance(x, list) else "")
    domain_embeddings = embedder.encode(investors_df["domain_text"].tolist(), show_progress_bar=False)
    
    mlb_stages = MultiLabelBinarizer()
    stage_features = mlb_stages.fit_transform(investors_df["stage_pref"])
    
    print("Startup complete.")

@app.post("/match", response_model=MatchResponse)
async def match_investors(startup: StartupInput):
    if investors_df is None or match_model is None:
        raise HTTPException(status_code=503, detail="Service not ready. Resources failed to load.")

    try:
        # Startup Features
        startup_text = " ".join(startup.sector)
        startup_embed = embedder.encode([startup_text])
        
        # Determine Stage Feature Vector
        # We need to transform robustly, handling unknown classes if possible or ignoring warnings
        # MultiLabelBinarizer transforms list of iterables
        # startup.stage is a single string, so wrap it: [[startup.stage]]
        try:
             # This might warn on unknown classes but works
            startup_stage_vec = mlb_stages.transform([[startup.stage]])
        except Exception:
             # Fallback if strict unknown class handling: vector of zeros
            startup_stage_vec = np.zeros((1, stage_features.shape[1]))

        # Calculate Similarity Metrics
        domain_similarity = cosine_similarity(startup_embed, domain_embeddings).flatten()
        stage_match = stage_features.dot(startup_stage_vec.T).flatten()

        # Construct DataFrame for Prediction
        pairwise_df = pd.DataFrame({
            "domain_similarity": domain_similarity,
            "stage_match": stage_match,
            "growth_rate": startup.growth_rate,
            "confidence_score": investors_df["confidence_score"].fillna(0),
            "safety_score": investors_df["safety_score"],
            "volatility_score": investors_df["activity_volatility"],
            "growth_dependency": investors_df["growth_dependency"]
        })

        # XGBoost Prediction
        # Ensure column order matches training
        features = [
            "domain_similarity", "stage_match", "growth_rate", 
            "confidence_score", "safety_score", "volatility_score", "growth_dependency"
        ]
        
        match_probs = match_model.predict_proba(pairwise_df[features])[:, 1]
        
        pairwise_df["match_probability"] = match_probs

        # Final Score Calculation
        pairwise_df["final_score"] = (
            0.45 * pairwise_df["match_probability"]
          + 0.20 * pairwise_df["confidence_score"]
          + 0.15 * (1 - pairwise_df["volatility_score"].rank(pct=True))
          + 0.20 * pairwise_df["safety_score"].rank(pct=True)
        )

        # Merge with Investor Info
        results = investors_df.copy()
        results["match_score"] = pairwise_df["final_score"]
        results["match_probability"] = pairwise_df["match_probability"]

        # Sort and Top 10
        top_investors = results.sort_values("match_score", ascending=False).head(10)
        
        matches = []
        for _, row in top_investors.iterrows():
            matches.append(InvestorMatch(
                name=row["name"],
                match_score=float(row["match_score"]),
                match_probability=float(row["match_probability"]),
                safety_label=row["safety_label"],
                growth_dependency=float(row["growth_dependency"]),
                activity_volatility=float(row["activity_volatility"]),
                confidence_score=float(row["confidence_score"] if pd.notnull(row["confidence_score"]) else 0.0)
            ))
            
        return MatchResponse(matches=matches)

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Matching failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
