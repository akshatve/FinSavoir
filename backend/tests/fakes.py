import pandas as pd


class FakeTicker:
    """Stand-in for yfinance.Ticker with controllable data."""

    def __init__(self, info=None, history=None, financials=None, balance_sheet=None, cashflow=None):
        self.info = info or {}
        self._history = history if history is not None else pd.DataFrame()
        self.financials = financials if financials is not None else pd.DataFrame()
        self.income_stmt = self.financials
        self.balance_sheet = balance_sheet if balance_sheet is not None else pd.DataFrame()
        self.cashflow = cashflow if cashflow is not None else pd.DataFrame()
        self.history_calls = 0

    def history(self, period="1y"):
        self.history_calls += 1
        return self._history


def statement(rows: dict, years=(2025, 2024)):
    cols = [pd.Timestamp(f"{y}-09-30") for y in years]
    return pd.DataFrame({c: {k: v[i] for k, v in rows.items()} for i, c in enumerate(cols)})


def ohlc(n=20, start=100.0):
    idx = pd.date_range("2026-10-01", periods=n, freq="B")
    closes = [start + i for i in range(n)]
    return pd.DataFrame(
        {"Open": [c - 0.5 for c in closes], "High": [c + 1 for c in closes],
         "Low": [c - 1 for c in closes], "Close": closes, "Volume": [1000] * n},
        index=idx,
    )
