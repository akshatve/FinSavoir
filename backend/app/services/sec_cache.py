import requests
import time
import threading
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.company import Company
from app.models.financials import AnnualFinancial

SEC_HEADERS = {
    "User-Agent": "FinSavoir admin@finsavoir.com",
    "Accept-Encoding": "gzip, deflate",
}

# Track status so the frontend could optionally know if it's loading
_sec_cache_status = {
    "is_loading": False,
    "last_updated": None,
}

def _fetch_cik_list():
    """Download the SEC ticker->CIK mapping once per run."""
    url = "https://www.sec.gov/files/company_tickers.json"
    res = requests.get(url, headers=SEC_HEADERS)
    if res.status_code != 200:
        raise Exception("Failed to fetch CIK list")
    return {item["ticker"].upper(): str(item["cik_str"]).zfill(10) for item in res.json().values()}

def _fetch_single_company(db: Session, company: Company, cik_map: dict):
    """Fetch and save financials for one company."""
    ticker = company.ticker
    cik = cik_map.get(ticker)
    
    if not cik:
        return  # Ticker not listed on SEC
    
    company.cik = cik
    db.commit()

    # Check if we already have data
    existing = db.query(AnnualFinancial).filter(AnnualFinancial.company_id == company.id).first()
    if existing:
        return  # Skip if already fetched

    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
    res = requests.get(url, headers=SEC_HEADERS)
    if res.status_code != 200:
        return

    facts = res.json().get("facts", {}).get("us-gaap", {})

    def extract(tag_names):
        results = {}
        for tag in tag_names:
            if tag in facts:
                for entry in facts[tag].get("units", {}).get("USD", []):
                    if entry.get("form") == "10-K":
                        fy = entry.get("fy")
                        if fy and fy not in results:
                            results[fy] = entry.get("val")
        return results

    field_map = {
        "revenue": ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax"],
        "operating_income": ["OperatingIncomeLoss"],
        "net_income": ["NetIncomeLoss"],
        "interest_expense": ["InterestExpense"],
        "total_assets": ["Assets"],
        "total_liabilities": ["Liabilities"],
        "current_assets": ["AssetsCurrent"],
        "current_liabilities": ["LiabilitiesCurrent"],
        "total_debt": ["LongTermDebt", "DebtCurrent"],
        "operating_cash_flow": ["NetCashProvidedByUsedInOperatingActivities"],
        "capex": ["PaymentsToAcquirePropertyPlantAndEquipment"],
        "diluted_shares": ["WeightedAverageNumberOfDilutedSharesOutstanding"],
    }

    extracted = {field: extract(tags) for field, tags in field_map.items()}
    all_years = set()
    for values in extracted.values():
        all_years.update(values.keys())

    for year in all_years:
        def get(f): return extracted[f].get(year)
        ocf = get("operating_cash_flow")
        capex = get("capex")
        fcf = (ocf - capex) if (ocf is not None and capex is not None) else None
        
        record = AnnualFinancial(
            company_id=company.id,
            fiscal_year=year,
            revenue=get("revenue"),
            operating_income=get("operating_income"),
            net_income=get("net_income"),
            interest_expense=get("interest_expense"),
            total_assets=get("total_assets"),
            total_liabilities=get("total_liabilities"),
            current_assets=get("current_assets"),
            current_liabilities=get("current_liabilities"),
            total_debt=get("total_debt"),
            operating_cash_flow=ocf,
            capex=capex,
            free_cash_flow=fcf,
            diluted_shares=get("diluted_shares"),
        )
        db.add(record)
    
    db.commit()


def _background_fetch_loop():
    """Runs every 24 hours to check for new filings."""
    global _sec_cache_status
    while True:
        try:
            _sec_cache_status["is_loading"] = True
            print("[SEC CACHE] Starting daily SEC data update...")
            
            db = SessionLocal()
            cik_map = _fetch_cik_list()
            companies = db.query(Company).all()
            
            for company in companies:
                try:
                    _fetch_single_company(db, company, cik_map)
                    time.sleep(0.15)  # Be polite to SEC
                except Exception as e:
                    print(f"[SEC CACHE] Failed {company.ticker}: {e}")
            
            db.close()
            _sec_cache_status["is_loading"] = False
            _sec_cache_status["last_updated"] = datetime.now()
            print("[SEC CACHE] Daily update complete.")
            
        except Exception as e:
            print(f"[SEC CACHE] Background loop error: {e}")
            _sec_cache_status["is_loading"] = False
        
        # Sleep for 24 hours before next run
        time.sleep(24 * 60 * 60)

def start_sec_cache():
    """Call this on startup."""
    if not _sec_cache_status["is_loading"]:
        thread = threading.Thread(target=_background_fetch_loop, daemon=True)
        thread.start()