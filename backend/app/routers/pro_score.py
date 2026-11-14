from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.company import Company
from app.models.financials import AnnualFinancial
# Make sure both are imported:
from app.services.pro_score.calculator import calculate_quality_score, calculate_business_risk
from app.schemas.pro_score import ScoreResponse
from app.services.summary_generator import generate_summary
from app.services.filings_service import get_company_filings

router = APIRouter(prefix="/pro-score", tags=["Pro Score"])

@router.get("/{ticker}")
def get_pro_score(ticker: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.ticker == ticker.upper()).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    financials = db.query(AnnualFinancial)\
        .filter(AnnualFinancial.company_id == company.id)\
        .order_by(AnnualFinancial.fiscal_year.desc())\
        .limit(8)\
        .all()

    # NEW: If we have ZERO financial data at all, return clean not_supported status
    if not financials:
        return {
            "ticker": company.ticker,
            "name": company.name,
            "financial_quality": {
                "score": None,
                "status": "not_supported",
                "message": "FinSavoir does not yet have SEC financial data for this company. This is common for banks, REITs, and other financial companies whose filings use different XBRL tags.",
            },
            "business_risk": {
                "score": None,
                "status": "not_supported",
                "message": "Data not yet available.",
            },
        }

    quality_data = calculate_quality_score(financials)
    risk_data = calculate_business_risk(financials)

    return {
        "ticker": company.ticker,
        "name": company.name,
        "financial_quality": quality_data,
        "business_risk": risk_data,
    }



@router.get("/summary/{ticker}")
def get_company_summary(ticker: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.ticker == ticker.upper()).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    financials = db.query(AnnualFinancial)\
        .filter(AnnualFinancial.company_id == company.id)\
        .order_by(AnnualFinancial.fiscal_year.desc())\
        .limit(5)\
        .all()

    # NEW: Handle empty financials
    if not financials:
        return {
            "ticker": company.ticker,
            "name": company.name,
            "summary": {
                "status": "not_supported",
                "message": "FinSavoir does not yet have SEC financial data for this company. Summary analysis is unavailable.",
            },
        }

    summary_data = generate_summary(company, financials)

    return {
        "ticker": company.ticker,
        "name": company.name,
        "summary": summary_data,
    }



@router.get("/filings/{ticker}")
def get_filings(ticker: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.ticker == ticker.upper()).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    if not company.cik:
        return {
            "ticker": company.ticker,
            "name": company.name,
            "cik": None,
            "filings": [],
            "message": "CIK not yet assigned. Filings will appear after the next data refresh.",
        }

    filings = get_company_filings(ticker, company.cik, limit=40)

    return {
        "ticker": company.ticker,
        "name": company.name,
        "cik": company.cik,
        "filings": filings,
    }