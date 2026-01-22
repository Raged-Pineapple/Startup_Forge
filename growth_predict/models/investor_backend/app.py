import os
import math
import random
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI(title="Startup Forge Prediction (Lite)")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Lite Models ---
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

class PredictInput(BaseModel):
    company: str
    domain: str
    funding_amount: float
    valuation: float
    funding_year: int
    competitors: List[str]
    umbrella_companies: List[str]

class PredictResponse(BaseModel):
    growth_rate: float
    growth_class: str
    valuation_projection: Dict[str, float]
    acquisition_probability: float

# --- Health Check ---
@app.get("/")
def health_check():
    return {"status": "ok"}

# --- Lite Logic: Match ---
@app.post("/match", response_model=MatchResponse)
async def match_investors(startup: StartupInput):
    # Mock / Heuristic Matching requiring NO heavy libraries
    # Returns some static high-quality filler data for demo purposes
    
    matches = [
        InvestorMatch(
            name="Sequoia (Demo)",
            match_score=0.95,
            match_probability=0.88,
            safety_label="Low Risk",
            growth_dependency=0.4,
            activity_volatility=0.2,
            confidence_score=0.9
        ),
        InvestorMatch(
            name="Andreessen Horowitz (Demo)",
            match_score=0.91,
            match_probability=0.85,
            safety_label="Moderate Risk",
            growth_dependency=0.6,
            activity_volatility=0.3,
            confidence_score=0.85
        ),
         InvestorMatch(
            name="Y Combinator (Demo)",
            match_score=0.89,
            match_probability=0.82,
            safety_label="Low Risk",
            growth_dependency=0.3,
            activity_volatility=0.2,
            confidence_score=0.95
        )
    ]
    
    return MatchResponse(matches=matches)

# --- Lite Logic: Predict ---
@app.post("/predict", response_model=PredictResponse)
async def predict_growth(data: PredictInput):
    # Lightweight heuristics without numpy/pandas
    
    # Growth Estimation
    import datetime
    current_year = datetime.datetime.now().year
    years_elapsed = max(0.5, current_year - data.funding_year)
    
    growth_rate = 0.15 # Baseline
    if data.valuation > data.funding_amount and data.funding_amount > 0:
         multiple = data.valuation / data.funding_amount
         # Log approximation: ln(x) approx 2*(x-1)/(x+1) for x close to 1
         # But math.log is standard python
         growth_rate = math.log(multiple) / years_elapsed
    
    # Cap values
    growth_rate = max(0.0, min(growth_rate, 2.0))
    
    # Classification
    if growth_rate > 0.5:
        growth_class = "High"
    elif growth_rate > 0.15:
        growth_class = "Medium"
    else:
        growth_class = "Low"

    # Projections
    def project(t):
        return data.valuation * math.exp(growth_rate * t)

    projections = {
        "3_months": project(0.25),
        "6_months": project(0.5),
        "1_year": project(1.0),
        "5_years": project(5.0)
    }
    
    # Acquisition Probability
    base_prob = 0.3
    if len(data.competitors) > 5:
        base_prob += 0.2
    if data.valuation > 100_000_000:
        base_prob -= 0.1
    
    acq_prob = max(0.0, min(base_prob, 1.0))

    return PredictResponse(
        growth_rate=growth_rate,
        growth_class=growth_class,
        valuation_projection=projections,
        acquisition_probability=round(acq_prob, 2)
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
