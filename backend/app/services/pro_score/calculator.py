from app.services.pro_score.anchors import (
    QUALITY_ANCHORS,
    QUALITY_WEIGHTS,
    RISK_ANCHORS,
)


def map_to_score(value, anchors, reverse=False):
    if value is None:
        return None
        
    # If reverse, flip the anchors so we are always mapping low->high correctly
    if reverse:
        lo = min(anchors)
        hi = max(anchors)
        # Invert the percentage because lower is better
        pct = (hi - value) / (hi - lo)
    else:
        lo = min(anchors)
        hi = max(anchors)
        pct = (value - lo) / (hi - lo)
        
    return round(max(0.0, min(1.0, pct)) * 100.0)



def calculate_quality_score(financials: list):
    """Requires a list of AnnualFinancial objects, newest first."""
    # 1. Check Data Availability Rule
    if len(financials) < 3:
        return {
            "score": None, 
            "status": "insufficient_data", 
            "message": f"Needs at least 3 fiscal years of reported data; {len(financials)} available."
        }
    
    latest = financials[0]
    prev = financials[1]
    measures = []

    # --- Measure 1: Return on Assets ---
    if latest.net_income is not None and latest.total_assets and prev.total_assets:
        avg_assets = (latest.total_assets + prev.total_assets) / 2
        roa = latest.net_income / avg_assets
        measures.append({
            "key": "return_on_assets",
            "value": roa,
            "points": map_to_score(roa, QUALITY_ANCHORS["return_on_assets"]),
            "weight": QUALITY_WEIGHTS["return_on_assets"]
        })

    # --- Measure 2: Current Ratio ---
    if latest.current_assets and latest.current_liabilities:
        cr = latest.current_assets / latest.current_liabilities
        measures.append({
            "key": "current_ratio",
            "value": cr,
            "points": map_to_score(cr, QUALITY_ANCHORS["current_ratio"]),
            "weight": QUALITY_WEIGHTS["current_ratio"]
        })

    # --- Measure 3: Debt to OCF ---
    if latest.total_debt is not None and latest.operating_cash_flow is not None:
        if latest.operating_cash_flow <= 0:
            # Scored as weakest value per screenshot logic
            debt_ocf_points = 0
            debt_ocf_value = None
        else:
            debt_ocf_value = latest.total_debt / latest.operating_cash_flow
            debt_ocf_points = map_to_score(debt_ocf_value, QUALITY_ANCHORS["debt_to_ocf"], reverse=True)

            
        measures.append({
            "key": "debt_to_ocf",
            "value": debt_ocf_value,
            "points": debt_ocf_points,
            "weight": QUALITY_WEIGHTS["debt_to_ocf"]
        })

    # (You will add the other 6 measures here later)

        # --- Measure 4: Operating Margin ---
    if latest.operating_income is not None and latest.revenue:
        op_margin = float(latest.operating_income / latest.revenue)
        measures.append({
            "key": "operating_margin",
            "value": op_margin,
            "points": map_to_score(op_margin, QUALITY_ANCHORS["operating_margin"]),
            "weight": QUALITY_WEIGHTS["operating_margin"]
        })

    # --- Measure 5: Free Cash Flow Margin ---
    if latest.free_cash_flow is not None and latest.revenue:
        fcf_margin = float(latest.free_cash_flow / latest.revenue)
        measures.append({
            "key": "free_cash_flow_margin",
            "value": fcf_margin,
            "points": map_to_score(fcf_margin, QUALITY_ANCHORS["free_cash_flow_margin"]),
            "weight": QUALITY_WEIGHTS["free_cash_flow_margin"]
        })

    # --- Measure 6: Cash Conversion ---
    if latest.free_cash_flow is not None and latest.net_income and latest.net_income > 0:
        cash_conv = float(latest.free_cash_flow / latest.net_income)
        measures.append({
            "key": "cash_conversion",
            "value": cash_conv,
            "points": map_to_score(cash_conv, QUALITY_ANCHORS["cash_conversion"]),
            "weight": QUALITY_WEIGHTS["cash_conversion"]
        })

    # --- Measure 7: Interest Coverage ---
    if latest.operating_income and latest.interest_expense and latest.interest_expense > 0:
        int_cov = float(latest.operating_income / latest.interest_expense)
        measures.append({
            "key": "interest_coverage",
            "value": int_cov,
            "points": map_to_score(int_cov, QUALITY_ANCHORS["interest_coverage"]),
            "weight": QUALITY_WEIGHTS["interest_coverage"]
        })

    # --- Measure 8: Operating Margin Stability ---
    # (Needs at least 4 years of data. We have up to 8.)
    op_margins = [f.operating_income / f.revenue for f in financials if f.operating_income and f.revenue]
    if len(op_margins) >= 4:
        import statistics
        std_dev = statistics.stdev(op_margins)
        measures.append({
            "key": "operating_margin_stability",
            "value": std_dev,
            "points": map_to_score(std_dev, QUALITY_ANCHORS["operating_margin_stability"], reverse=True),
            "weight": QUALITY_WEIGHTS["operating_margin_stability"]
        })

    # --- Measure 9: Profitable Years ---
    # Needs at least 3 years of data
    if len(financials) >= 3:
        profitable_years = sum(1 for f in financials if f.net_income and f.net_income > 0)
        prof_pct = float(profitable_years / len(financials))
        measures.append({
            "key": "profitable_years",
            "value": prof_pct,
            "points": map_to_score(prof_pct, QUALITY_ANCHORS["profitable_years"]),
            "weight": QUALITY_WEIGHTS["profitable_years"]
        })

    # 2. Calculate Final Weighted Score
    scored_measures = [m for m in measures if m["points"] is not None]
    if not scored_measures:
        return {"score": None, "status": "insufficient_data", "message": "No scoreable measures available."}
        
    total_weight = sum(m["weight"] for m in scored_measures)
    final_score = sum(m["points"] * m["weight"] for m in scored_measures) / total_weight
    
    return {
        "score": round(final_score),
        "status": "ok",
        "measures": measures
    }







def calculate_business_risk(financials: list):
    if len(financials) < 3:
        return {
            "score": None, 
            "status": "insufficient_data", 
            "message": f"Needs at least 3 fiscal years of reported data; {len(financials)} available."
        }
        
    latest = financials[0]
    measures = []

    # --- 1. Liabilities to Assets ---
    if latest.total_liabilities is not None and latest.total_assets:
        liab_assets = float(latest.total_liabilities / latest.total_assets)
        measures.append({
            "key": "liabilities_to_assets",
            "value": liab_assets,
            "points": map_to_score(liab_assets, RISK_ANCHORS["liabilities_to_assets"]),
            "weight": 0.20
        })

    # --- 2. Share Dilution ---
    if len(financials) >= 2 and financials[0].diluted_shares and financials[1].diluted_shares:
        latest_shares = financials[0].diluted_shares
        prev_shares = financials[1].diluted_shares
        if prev_shares > 0:
            dilution = float((latest_shares - prev_shares) / prev_shares)
            # If they bought back shares, dilution is negative (good). Clamp to 0.
            dilution = max(0.0, dilution) 
            measures.append({
                "key": "share_dilution",
                "value": dilution,
                "points": map_to_score(dilution, RISK_ANCHORS["share_dilution"]),
                "weight": 0.05
        })

    # --- 3. Weakest Interest Coverage (lowest over last 5 years) ---
    coverages = [
        (f.operating_income / f.interest_expense) 
        for f in financials[:5] 
        if f.operating_income and f.interest_expense and f.interest_expense > 0
    ]
    if coverages:
        weakest = float(min(coverages))
        measures.append({
            "key": "weakest_interest_coverage",
            "value": weakest,
            "points": map_to_score(weakest, RISK_ANCHORS["weakest_interest_coverage"], reverse=True),
            "weight": 0.20
        })

    # --- 4. Worst Revenue Decline ---
    revenue_growths = []
    for i in range(len(financials) - 1):
        curr_rev = financials[i].revenue
        prev_rev = financials[i+1].revenue
        if curr_rev and prev_rev and prev_rev > 0:
            growth = float((curr_rev - prev_rev) / prev_rev)
            revenue_growths.append(growth)
            
    if revenue_growths:
        worst_decline = float(min(revenue_growths))
        measures.append({
            "key": "worst_revenue_decline",
            "value": worst_decline,
            "points": map_to_score(worst_decline, RISK_ANCHORS["worst_revenue_decline"], reverse=True),
            "weight": 0.15
        })

    # --- 5. Loss Years ---
    if len(financials) >= 3:
        loss_years = sum(1 for f in financials if f.net_income is not None and f.net_income < 0)
        measures.append({
            "key": "loss_years",
            "value": loss_years,
            "points": map_to_score(loss_years, RISK_ANCHORS["loss_years"]),
            "weight": 0.15
        })

    # --- 6. Negative FCF Years ---
    fcf_years = [f for f in financials if f.free_cash_flow is not None]
    if len(fcf_years) >= 3:
        neg_fcf = sum(1 for f in fcf_years if f.free_cash_flow < 0)
        neg_pct = float(neg_fcf / len(fcf_years))
        measures.append({
            "key": "negative_fcf_years",
            "value": neg_pct,
            "points": map_to_score(neg_pct, RISK_ANCHORS["negative_fcf_years"]),
            "weight": 0.15
        })

    # --- 7. Deepest Earnings Drawdown ---
    if len(financials) >= 3:
        incomes = [f.net_income for f in financials if f.net_income is not None]
        # Find largest peak-to-trough drop
        deepest_drop = 0.0
        peak = -float('inf')
        for inc in incomes:
            if inc > peak:
                peak = inc
            elif peak > 0 and inc < peak:
                drop = (inc - peak) / peak  # Negative number
                if drop < deepest_drop:
                    deepest_drop = drop
        
        if deepest_drop < 0:
            measures.append({
                "key": "deepest_earnings_drawdown",
                "value": float(deepest_drop),
                "points": map_to_score(deepest_drop, RISK_ANCHORS["deepest_earnings_drawdown"], reverse=True),
                "weight": 0.10
            })

    # --- Final Score ---
    scored_measures = [m for m in measures if m["points"] is not None]
    if not scored_measures:
        return {"score": None, "status": "insufficient_data", "message": "No scoreable measures available."}
        
    total_weight = sum(m["weight"] for m in scored_measures)
    raw_score = sum(m["points"] * m["weight"] for m in scored_measures) / total_weight
    
    # Invert: In our measures, higher points = MORE risk.
    # But the UI card says "Higher = safer", so we flip it.
    final_score = 100 - raw_score
    
    return {
        "score": round(final_score),
        "status": "ok",
        "measures": measures
    }