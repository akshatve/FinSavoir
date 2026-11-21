"""Pure helpers for turning SEC XBRL `companyfacts` JSON into annual figures.

Why this exists
---------------
In SEC companyfacts data, the ``fy`` field on every fact is the fiscal year of
the *filing* that reported it, not the year the number belongs to. A 10-K for
FY2023 also repeats the FY2022 and FY2021 comparatives, and all of those carry
``fy == 2023``. Picking "the first fact with fy == 2023" therefore often
returns a prior year's value.

The functions here keep only the facts that describe each annual filing's own
reporting period (the latest period end inside that filing), so each fiscal
year gets the number the company reported for that year.
"""

from __future__ import annotations

from datetime import date

ANNUAL_FORMS = {"10-K", "10-K/A"}

# One-year duration facts span roughly 52-53 weeks. Anything far outside that
# window (a quarter, a stub period) is not an annual figure.
MIN_ANNUAL_DAYS = 330
MAX_ANNUAL_DAYS = 380


def _parse(d: str | None) -> date | None:
    if not d:
        return None
    try:
        return date.fromisoformat(d)
    except ValueError:
        return None


def filing_period_ends(facts: dict) -> dict[str, str]:
    """Map each annual filing (accession number) to its own period end.

    The period a 10-K reports on is the latest ``end`` date appearing in it;
    earlier ends are comparatives.
    """
    ends: dict[str, str] = {}
    for tag in facts.values():
        for unit_entries in tag.get("units", {}).values():
            for e in unit_entries:
                if e.get("form") not in ANNUAL_FORMS:
                    continue
                accn, end = e.get("accn"), e.get("end")
                if accn and end and end > ends.get(accn, ""):
                    ends[accn] = end
    return ends


def extract_annual(facts: dict, tag_names: list[str], period_ends: dict[str, str] | None = None,
                   unit: str = "USD") -> dict[int, dict]:
    """Return ``{fiscal_year: {"val", "end", "accn", "filed", "form", "tag"}}``.

    ``tag_names`` are tried in priority order; a year found under an earlier
    tag is never overwritten by a later one. When a year appears in more than
    one annual filing (for example an original 10-K and a 10-K/A), the most
    recently filed one wins.
    """
    if period_ends is None:
        period_ends = filing_period_ends(facts)

    results: dict[int, dict] = {}
    for tag in tag_names:
        entries = facts.get(tag, {}).get("units", {}).get(unit, [])
        found: dict[int, dict] = {}
        for e in entries:
            if e.get("form") not in ANNUAL_FORMS or e.get("fp") != "FY":
                continue
            accn, end, fy = e.get("accn"), e.get("end"), e.get("fy")
            if not accn or not end or fy is None or e.get("val") is None:
                continue
            # Only the filing's own period; skip prior-year comparatives.
            if period_ends.get(accn) != end:
                continue
            start = _parse(e.get("start"))
            if start is not None:
                span = (_parse(end) - start).days
                if not (MIN_ANNUAL_DAYS <= span <= MAX_ANNUAL_DAYS):
                    continue
            prev = found.get(fy)
            if prev is None or (e.get("filed") or "") > (prev.get("filed") or ""):
                found[fy] = {
                    "val": e["val"],
                    "end": end,
                    "accn": accn,
                    "filed": e.get("filed"),
                    "form": e.get("form"),
                    "tag": tag,
                }
        for fy, rec in found.items():
            results.setdefault(fy, rec)
    return results


def legacy_extract(facts: dict, tag_names: list[str]) -> dict[int, float]:
    """The original FinSavoir mapping, kept only so it can be compared in tests
    and in ``scripts/verify_sec_periods.py``. Do not use for new data."""
    results: dict[int, float] = {}
    for tag in tag_names:
        if tag in facts:
            for entry in facts[tag].get("units", {}).get("USD", []):
                if entry.get("form") == "10-K":
                    fy = entry.get("fy")
                    if fy and fy not in results:
                        results[fy] = entry.get("val")
    return results


# Field -> XBRL tags, in priority order. Shared by the background refresher and
# the one-off scripts so they can never drift apart again.
FIELD_TAGS: dict[str, list[str]] = {
    "revenue": [
        "Revenues",
        "RevenueFromContractWithCustomerExcludingAssessedTax",
        "RevenueFromContractWithCustomerIncludingAssessedTax",
        "SalesRevenueNet",
    ],
    "operating_income": ["OperatingIncomeLoss"],
    "net_income": ["NetIncomeLoss"],
    "interest_expense": ["InterestExpense", "InterestExpenseNonoperating"],
    "total_assets": ["Assets"],
    "total_liabilities": ["Liabilities"],
    "current_assets": ["AssetsCurrent"],
    "current_liabilities": ["LiabilitiesCurrent"],
    "total_debt": ["LongTermDebt", "LongTermDebtNoncurrent", "DebtCurrent"],
    "operating_cash_flow": [
        "NetCashProvidedByUsedInOperatingActivities",
        "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations",
    ],
    "capex": ["PaymentsToAcquirePropertyPlantAndEquipment", "PaymentsToAcquireProductiveAssets"],
}

SHARE_FIELD_TAGS: dict[str, list[str]] = {
    "diluted_shares": ["WeightedAverageNumberOfDilutedSharesOutstanding"],
}


def annual_rows(companyfacts_json: dict) -> dict[int, dict]:
    """Build one row per fiscal year from a full companyfacts response."""
    facts = companyfacts_json.get("facts", {}).get("us-gaap", {})
    ends = filing_period_ends(facts)
    extracted = {f: extract_annual(facts, tags, ends) for f, tags in FIELD_TAGS.items()}
    extracted.update({f: extract_annual(facts, tags, ends, unit="shares") for f, tags in SHARE_FIELD_TAGS.items()})

    years: set[int] = set()
    for values in extracted.values():
        years.update(values)

    rows: dict[int, dict] = {}
    for fy in sorted(years):
        row: dict = {"fiscal_year": fy}
        for field, values in extracted.items():
            rec = values.get(fy)
            row[field] = rec["val"] if rec else None
        ocf, capex = row["operating_cash_flow"], row["capex"]
        row["free_cash_flow"] = (ocf - capex) if (ocf is not None and capex is not None) else None
        # Provenance: the filing that reported revenue or, failing that, assets.
        src = extracted["revenue"].get(fy) or extracted["total_assets"].get(fy) or extracted["net_income"].get(fy)
        row["period_end"] = src["end"] if src else None
        row["accession"] = src["accn"] if src else None
        row["filed_date"] = src["filed"] if src else None
        rows[fy] = row
    return rows
