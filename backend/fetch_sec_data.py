import requests
import time
from datetime import datetime
from app.database import SessionLocal
from app.models.company import Company
from app.models.financials import AnnualFinancial
from app.services.sec_cache import _fetch_cik_list, _fetch_single_company, SEC_HEADERS

# SEC requires a User-Agent header
SEC_HEADERS = {
    "User-Agent": "FinSavoir admin@finsavoir.com",
    "Accept-Encoding": "gzip, deflate",
}

# The SEC uses a 10-digit zero-padded CIK number
def get_cik(ticker: str) -> str:
    """Look up a ticker's CIK from SEC's public mapping."""
    url = "https://www.sec.gov/files/company_tickers.json"
    res = requests.get(url, headers=SEC_HEADERS)
    if res.status_code != 200:
        raise Exception(f"Failed to fetch CIK list: {res.status_code}")
    
    data = res.json()
    # SEC JSON is a dict of dicts: {"0": {"cik_str": 320193, "ticker": "AAPL", ...}, ...}
    for key, item in data.items():
        if item["ticker"].upper() == ticker.upper():
            return str(item["cik_str"]).zfill(10)
    return None


import requests
import time
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.company import Company
from app.models.financials import AnnualFinancial

# SEC requires a User-Agent header
SEC_HEADERS = {
    "User-Agent": "FinSavoir admin@finsavoir.com",
    "Accept-Encoding": "gzip, deflate",
}

def fetch_cik_list() -> dict:
    """Download the SEC ticker->CIK mapping once per run."""
    url = "https://www.sec.gov/files/company_tickers.json"
    print("Downloading SEC CIK list...")
    res = requests.get(url, headers=SEC_HEADERS)
    if res.status_code != 200:
        raise Exception(f"Failed to fetch CIK list: {res.status_code}")
    
    # Create a dictionary mapping TICKER -> CIK string (zero-padded to 10 digits)
    cik_map = {}
    for item in res.json().values():
        cik_map[item["ticker"].upper()] = str(item["cik_str"]).zfill(10)
    return cik_map


def fetch_single_company(db: Session, company: Company, cik_map: dict):
    """Fetch and save financials for one company from SEC."""
    ticker = company.ticker
    
    # 1. Get the CIK
    cik = cik_map.get(ticker)
    if not cik:
        print(f"  -> CIK not found for {ticker}. Skipping.")
        return

    # Save CIK to company if not already set
    if company.cik != cik:
        company.cik = cik
        db.commit()

    # 2. Fetch the SEC companyfacts JSON
    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
    res = requests.get(url, headers=SEC_HEADERS)
    if res.status_code != 200:
        print(f"  -> Failed to fetch SEC data for {ticker}: {res.status_code}")
        return

    data = res.json()
    facts = data.get("facts", {}).get("us-gaap", {})
    
    # 3. Extract annual 10-K values for each metric
    def extract_annual_values(tag_names: list) -> dict:
        results = {}
        for tag_name in tag_names:
            if tag_name not in facts:
                continue
            units = facts[tag_name].get("units", {})
            for unit, entries in units.items():
                for entry in entries:
                    if entry.get("form") != "10-K":
                        continue
                    fiscal_year = entry.get("fy")
                    if fiscal_year is None:
                        continue
                    # Keep the most recently filed one
                    if fiscal_year not in results:
                        results[fiscal_year] = entry.get("val")
        return results
    
    # Map our fields to possible SEC XBRL tags
    field_map = {
        "revenue": ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax", "RevenueFromContractWithCustomerIncludingAssessedTax"],
        "operating_income": ["OperatingIncomeLoss"],
        "net_income": ["NetIncomeLoss"],
        "interest_expense": ["InterestExpense", "InterestExpenseNonoperating"],
        "total_assets": ["Assets"],
        "total_liabilities": ["Liabilities"],
        "current_assets": ["AssetsCurrent"],
        "current_liabilities": ["LiabilitiesCurrent"],
        "total_debt": ["LongTermDebt", "LongTermDebtNoncurrent", "DebtCurrent"],
        "operating_cash_flow": ["NetCashProvidedByUsedInOperatingActivities", "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations"],
        "capex": ["PaymentsToAcquirePropertyPlantAndEquipment", "PaymentsToAcquireProductiveAssets"],
        "diluted_shares": ["WeightedAverageNumberOfDilutedSharesOutstanding"],
    }
    
    # 4. Extract each field
    extracted = {}
    for field, tags in field_map.items():
        extracted[field] = extract_annual_values(tags)
    
    # 5. Merge into a per-year dictionary
    all_years = set()
    for values in extracted.values():
        all_years.update(values.keys())
    
    if not all_years:
        print(f"  -> No annual 10-K data found for {ticker}.")
        return

    print(f"  -> Found {len(all_years)} fiscal years: {sorted(all_years)}")
    
    # 6. Save to database
    try:
        saved_count = 0
        for year in sorted(all_years):
            # Skip if we already have this year (prevents duplicates)
            existing = db.query(AnnualFinancial).filter(
                AnnualFinancial.company_id == company.id,
                AnnualFinancial.fiscal_year == year,
            ).first()
            if existing:
                continue
            
            # Extract values for this year
            def get_val(field):
                return extracted[field].get(year)
            
            revenue = get_val("revenue")
            capex = get_val("capex")
            ocf = get_val("operating_cash_flow")
            fcf = (ocf - capex) if (ocf is not None and capex is not None) else None
            
            record = AnnualFinancial(
                company_id=company.id,
                fiscal_year=year,
                revenue=revenue,
                operating_income=get_val("operating_income"),
                net_income=get_val("net_income"),
                interest_expense=get_val("interest_expense"),
                total_assets=get_val("total_assets"),
                total_liabilities=get_val("total_liabilities"),
                current_assets=get_val("current_assets"),
                current_liabilities=get_val("current_liabilities"),
                total_debt=get_val("total_debt"),
                operating_cash_flow=ocf,
                capex=capex,
                free_cash_flow=fcf,
                diluted_shares=get_val("diluted_shares"),
            )
            db.add(record)
            saved_count += 1
        
        db.commit()
        if saved_count > 0:
            print(f"  -> Saved {saved_count} new fiscal years for {ticker}")
    except Exception as e:
        db.rollback()
        print(f"  -> DB error for {ticker}: {e}")


if __name__ == "__main__":
    db = SessionLocal()
    all_companies = db.query(Company).all()
    print(f"Found {len(all_companies)} companies in DB.\n")

    # Pre-download the CIK map once
    try:
        cik_map = fetch_cik_list()
        print(f"Loaded {len(cik_map)} tickers from SEC.\n")
    except Exception as e:
        print(f"Failed to load CIK map: {e}")
        db.close()
        exit()

    processed = 0
    skipped = 0
    etfs = ["SPY", "QQQ", "DIA", "IWM", "VTI", "VOO"]

    for company in all_companies:
        ticker = company.ticker.upper()

        # 1. Skip ETFs (they have no financials)
        if ticker in etfs:
            skipped += 1
            print(f"[SKIP] {ticker} — is an ETF")
            continue

        # 2. Skip if already in DB (this is why it skipped AAPL, MSFT, etc.)
        existing = db.query(AnnualFinancial).filter(
            AnnualFinancial.company_id == company.id
        ).first()
        if existing:
            skipped += 1
            print(f"[SKIP] {ticker} — already has data")
            continue

        # 3. Check if we have a CIK (either in DB or from SEC map)
        if not company.cik and ticker not in cik_map:
            skipped += 1
            print(f"[SKIP] {ticker} — no CIK on SEC")
            continue

        # 4. Fetch the data
        print(f"[FETCH] {ticker}...")
        try:
            fetch_single_company(db, company, cik_map)
            processed += 1
        except Exception as e:
            print(f"[FAIL] {ticker}: {e}")

        # Be polite to SEC servers (max 10 req/sec)
        time.sleep(0.2)

    db.close()
    print(f"\n✓ Done. Processed: {processed}, Skipped: {skipped}")