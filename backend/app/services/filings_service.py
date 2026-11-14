import requests
from datetime import datetime
from fastapi import HTTPException

SEC_HEADERS = {
    "User-Agent": "FinSavoir admin@finsavoir.com",
    "Accept-Encoding": "gzip, deflate",
}

def get_company_filings(ticker: str, cik: str, limit: int = 30) -> list:
    """Fetch recent SEC filings for a company by CIK."""
    if not cik:
        return []

    url = f"https://data.sec.gov/submissions/CIK{cik.zfill(10)}.json"
    try:
        res = requests.get(url, headers=SEC_HEADERS, timeout=10)
        if res.status_code != 200:
            return []
        data = res.json()
    except Exception as e:
        print(f"SEC filings fetch error for {ticker}: {e}")
        return []

    recent = data.get("filings", {}).get("recent", {})
    forms = recent.get("form", [])
    filing_dates = recent.get("filingDate", [])
    report_dates = recent.get("reportDate", [])
    accessions = recent.get("accessionNumber", [])
    primary_docs = recent.get("primaryDocument", [])
    descriptions = recent.get("primaryDocDescription", [])

    filings = []
    for i in range(min(limit, len(forms))):
        form = forms[i]
        # Only show relevant filings
        if form not in ["10-K", "10-Q", "8-K", "DEF 14A", "20-F", "40-F", "S-1"]:
            continue

        accession_no_dashes = accessions[i].replace("-", "")
        cik_clean = cik.zfill(10)

        # SEC URL structure for the filing folder
        filing_url = f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{accession_no_dashes}/{primary_docs[i]}"

        filings.append({
            "form_type": form,
            "filed_date": filing_dates[i],
            "report_date": report_dates[i] if report_dates[i] else None,
            "description": descriptions[i] if descriptions[i] else get_form_description(form),
            "url": filing_url,
        })

        if len(filings) >= limit:
            break

    return filings


def get_form_description(form: str) -> str:
    """Plain-English description of common SEC form types."""
    return {
        "10-K": "Annual report",
        "10-Q": "Quarterly report",
        "8-K": "Current report (material events)",
        "DEF 14A": "Proxy statement",
        "20-F": "Annual report (foreign private issuer)",
        "40-F": "Annual report (Canadian issuer)",
        "S-1": "Registration statement (IPO/new securities)",
    }.get(form, "SEC filing")