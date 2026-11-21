"""Check FinSavoir's fiscal-year mapping against SEC's own filing records.

For each company this script downloads two independent SEC datasets:

* ``submissions/CIK##########.json``: the filing index. Each 10-K lists its
  accession number and ``reportDate`` (the period the report covers).
* ``api/xbrl/companyfacts/CIK##########.json``: the XBRL facts.

The "truth" for a fiscal year is the fact reported *in that year's 10-K*
(matching accession number) whose period ends on that 10-K's ``reportDate``.
The script prints what the legacy mapping and the new mapping return for each
year, and exits non-zero if the new mapping disagrees with the filing.

Usage (needs outbound access to sec.gov):
    python scripts/verify_sec_periods.py AAPL MSFT NVDA
"""

import os
import sys
import time

import requests

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.sec_facts import (  # noqa: E402
    FIELD_TAGS,
    extract_annual,
    filing_period_ends,
    legacy_extract,
)

UA = {"User-Agent": os.environ.get("SEC_USER_AGENT", "FinSavoir verification script admin@finsavoir.com")}
CHECK_FIELDS = ["revenue", "net_income", "total_assets", "operating_cash_flow"]


def get(url):
    r = requests.get(url, headers=UA, timeout=30)
    r.raise_for_status()
    time.sleep(0.2)  # stay well under SEC's 10 requests/second limit
    return r.json()


def main(tickers):
    cik_map = {v["ticker"].upper(): str(v["cik_str"]).zfill(10)
               for v in get("https://www.sec.gov/files/company_tickers.json").values()}
    failures = 0
    for ticker in tickers:
        cik = cik_map[ticker.upper()]
        subs = get(f"https://data.sec.gov/submissions/CIK{cik}.json")["filings"]["recent"]
        ten_ks = {
            subs["accessionNumber"][i]: subs["reportDate"][i]
            for i, form in enumerate(subs["form"]) if form == "10-K"
        }
        facts = get(f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json")["facts"]["us-gaap"]
        ends = filing_period_ends(facts)

        print(f"\n=== {ticker} (CIK {cik}) ===")
        for field in CHECK_FIELDS:
            tags = FIELD_TAGS[field]
            new = extract_annual(facts, tags, ends)
            old = legacy_extract(facts, tags)
            # Ground truth straight from each 10-K.
            truth = {}
            for tag in tags:
                for e in facts.get(tag, {}).get("units", {}).get("USD", []):
                    rd = ten_ks.get(e.get("accn"))
                    if rd and e.get("end") == rd and e.get("fp") == "FY":
                        truth.setdefault(e["fy"], (e["val"], rd, e["accn"]))
            years = sorted(truth, reverse=True)[:5]
            print(f"  {field}")
            for fy in years:
                t_val, rd, accn = truth[fy]
                n = new.get(fy)
                n_val = n["val"] if n else None
                o_val = old.get(fy)
                ok_new = n_val == t_val
                ok_old = o_val == t_val
                failures += 0 if ok_new else 1
                print(f"    FY{fy} period_end={rd} 10-K={accn} filing={t_val:,} "
                      f"new={'OK' if ok_new else f'MISMATCH {n_val}'} "
                      f"legacy={'OK' if ok_old else f'WRONG {o_val:,}' if o_val is not None else 'WRONG None'}")
    print(f"\nnew-mapping mismatches: {failures}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or ["AAPL", "MSFT", "NVDA", "KO", "JPM"]))
