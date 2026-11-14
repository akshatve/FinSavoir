# (Value for 0 points, Value for 100 points)
QUALITY_ANCHORS = {
    "return_on_assets": (0.0, 0.15),       
    "current_ratio": (0.8, 2.0),           
    "debt_to_ocf": (5.0, 0.0),             # Reversed (lower is better)
    "operating_margin": (0.0, 0.30),
    "free_cash_flow_margin": (-0.05, 0.20),
    "cash_conversion": (0.30, 1.10),
    "interest_coverage": (1.5, 15.0),
    "operating_margin_stability": (0.12, 0.01), # Reversed
    "profitable_years": (0.50, 1.00),
}

RISK_ANCHORS = {
    "liabilities_to_assets": (0.40, 0.90),
    "share_dilution": (0.00, 0.10),
    "weakest_interest_coverage": (10.0, 1.0), # Reversed
    "worst_revenue_decline": (0.00, -0.30),   # Reversed
    "loss_years": (0, 3),                     # Count
    "negative_fcf_years": (0.00, 0.60),       # Percentage
    "deepest_earnings_drawdown": (0.00, -0.80),
}

# Weights from the screenshot
QUALITY_WEIGHTS = {
    "operating_margin": 0.15,
    "return_on_assets": 0.10,
    "free_cash_flow_margin": 0.10,
    "cash_conversion": 0.10,
    "debt_to_ocf": 0.15,
    "interest_coverage": 0.15,
    "current_ratio": 0.10,
    "operating_margin_stability": 0.10,
    "profitable_years": 0.05,
}