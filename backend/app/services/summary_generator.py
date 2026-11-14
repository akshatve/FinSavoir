import statistics
from app.models.financials import AnnualFinancial
from app.models.company import Company

def generate_summary(company: Company, financials: list) -> dict:
    """Generates a plain-English summary from annual financial data."""
    
    # Need at least 2 years to compare growth
    if len(financials) < 2:
        return {
            "status": "insufficient_data",
            "message": "Needs at least 2 fiscal years of data to generate a summary."
        }

    latest = financials[0]
    prev = financials[1]
    
    def pct_change(curr, prev):
        if curr is None or prev is None or prev == 0:
            return None
        return (curr - prev) / abs(prev)
        
    def fmt_currency(val):
        if val is None: return "N/A"
        if abs(val) >= 1e9: return f"${val/1e9:.2f}B"
        if abs(val) >= 1e6: return f"${val/1e6:.2f}M"
        return f"${val:,.0f}"

    def fmt_pct(val):
        if val is None: return "N/A"
        return f"{val*100:+.1f}%"

    # --- 1. Overview / Business ---
    rev_change = pct_change(latest.revenue, prev.revenue)
    overview = f"{company.name} is a company in the {company.sector or 'general'} sector. "
    if latest.revenue:
        overview += f"In its latest fiscal year (FY{latest.fiscal_year}), it reported revenue of {fmt_currency(latest.revenue)}"
        if rev_change is not None:
            overview += f", a {fmt_pct(rev_change)} change from the prior year."
        else:
            overview += "."
    else:
        overview += "Revenue data is not available."

    # --- 2. Growth & Profitability ---
    ni_change = pct_change(latest.net_income, prev.net_income)
    op_margin = (latest.operating_income / latest.revenue) if (latest.operating_income and latest.revenue) else None
    net_margin = (latest.net_income / latest.revenue) if (latest.net_income and latest.revenue) else None

    profitability = ""
    if latest.net_income is not None:
        if latest.net_income > 0:
            profitability = f"The company was profitable, reporting net income of {fmt_currency(latest.net_income)}"
            if net_margin: profitability += f" (a net margin of {net_margin*100:.1f}%)"
            if ni_change is not None: profitability += f", a {fmt_pct(ni_change)} change from the prior year."
            else: profitability += "."
        else:
            profitability = f"The company reported a net loss of {fmt_currency(abs(latest.net_income))}."
    else:
        profitability = "Net income data is not available."

    # --- 3. Cash & Debt ---
    cash_and_debt = ""
    if latest.operating_cash_flow is not None:
        cash_and_debt = f"Operating cash flow was {fmt_currency(latest.operating_cash_flow)}. "
    if latest.total_debt is not None:
        cash_and_debt += f"Total debt stood at {fmt_currency(latest.total_debt)}. "
        if latest.operating_cash_flow and latest.operating_cash_flow > 0:
            years_to_pay = latest.total_debt / latest.operating_cash_flow
            cash_and_debt += f"At the current cash flow rate, it would take {years_to_pay:.1f} years to pay off this debt."

    # --- 4. Strengths & Watch-items (based on simple rules) ---
    strengths = []
    watch_items = []
    
    if net_margin and net_margin > 0.15: strengths.append(f"Strong net margin of {net_margin*100:.1f}%")
    if op_margin and op_margin > 0.2: strengths.append(f"Healthy operating margin of {op_margin*100:.1f}%")
    if latest.current_assets and latest.current_liabilities:
        cr = latest.current_assets / latest.current_liabilities
        if cr > 2.0: strengths.append(f"Strong liquidity with a current ratio of {cr:.1f}x")
        elif cr < 1.0: watch_items.append(f"Tight liquidity (current ratio {cr:.1f}x)")
    
    if latest.net_income and latest.net_income < 0: watch_items.append("Currently unprofitable")
    if rev_change is not None and rev_change < -0.1: watch_items.append(f"Revenue declined {abs(rev_change)*100:.1f}% year-over-year")
    if not strengths: strengths.append("Data is limited for a strong positive signal.")
    if not watch_items: watch_items.append("No major red flags found in the reported data.")

    return {
        "status": "ok",
        "fiscal_year": latest.fiscal_year,
        "raw": {
            "revenue": latest.revenue,
            "net_income": latest.net_income,
            "operating_cash_flow": latest.operating_cash_flow,
            "total_debt": latest.total_debt,
            "total_assets": latest.total_assets,
            "operating_income": latest.operating_income,
        },
        "sections": {
            "overview": overview,
            "profitability": profitability,
            "cash_and_debt": cash_and_debt if cash_and_debt else "Cash and debt data not fully available.",
            "strengths": strengths,
            "watch_items": watch_items
        }
    }