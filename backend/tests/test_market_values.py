"""Displayed financial values must come from real data fields."""
import pytest

from app.services import market_data
from tests.fakes import FakeTicker, ohlc, statement


def test_dividend_yield_is_a_fraction_derived_from_rate_and_price():
    # Yahoo has sent dividendYield as 0.41 (percent) for a 0.41% yield; ignore it.
    info = {"dividendRate": 1.04, "currentPrice": 260.0, "dividendYield": 0.41}
    assert market_data.dividend_yield_from_info(info) == pytest.approx(0.004)


def test_dividend_yield_falls_back_to_trailing_fraction_or_none():
    assert market_data.dividend_yield_from_info({"trailingAnnualDividendYield": 0.02}) == 0.02
    assert market_data.dividend_yield_from_info({}) is None


def test_overview_free_cash_flow_comes_from_cash_flow_statement(monkeypatch):
    fake = FakeTicker(
        info={"symbol": "TEST", "longName": "Test Co", "currentPrice": 10.0,
              "fullExchangeName": "NasdaqGS"},
        financials=statement({"Total Revenue": [200.0, 100.0], "Net Income": [20.0, 10.0]}),
        balance_sheet=statement({"Total Debt": [5.0, 5.0]}),
        cashflow=statement({"Free Cash Flow": [30.0, 15.0]}),
    )
    monkeypatch.setattr(market_data.yf, "Ticker", lambda t: fake)
    data = market_data.get_company_overview("TEST")
    assert data["free_cash_flow"] == 30.0
    assert data["free_cash_flow_yoy"] == pytest.approx(100.0)
    assert data["exchange"] == "NasdaqGS"


def test_statistics_reports_real_52_week_range(monkeypatch):
    fake = FakeTicker(info={"symbol": "TEST", "marketCap": 1e12, "fiftyTwoWeekHigh": 250.5,
                            "fiftyTwoWeekLow": 160.25, "beta": 1.1})
    monkeypatch.setattr(market_data.yf, "Ticker", lambda t: fake)
    perf = market_data.get_company_statistics("TEST")["performance"]
    assert perf["fifty_two_week_high"] == 250.5
    assert perf["fifty_two_week_low"] == 160.25
    # Not derived from market cap.
    assert perf["fifty_two_week_high"] != 1e12 * 0.05


def test_trending_candles_are_the_real_price_history(monkeypatch):
    hist = ohlc(20)
    monkeypatch.setattr(market_data.yf, "Ticker", lambda t: FakeTicker(info={"shortName": t}, history=hist))
    rows = market_data.get_trending_stocks()
    assert rows, "expected trending rows"
    candles = rows[0]["candles"]
    assert len(candles) == 15
    assert [c["close"] for c in candles] == [round(float(x), 2) for x in hist["Close"].tail(15)]
