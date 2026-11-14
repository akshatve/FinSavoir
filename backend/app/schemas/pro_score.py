from pydantic import BaseModel
from typing import Optional, Dict, Any

class ScoreResponse(BaseModel):
    ticker: str
    name: str
    financial_quality: Dict[str, Any]
    business_risk: Dict[str, Any]