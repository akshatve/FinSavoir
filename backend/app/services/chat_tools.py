from app.services.stock_cache import _stock_cache, _movers_cache
from app.services.news_cache import _news_cache

# ─── Tool 1 (existing): Stock Fundamentals ───
def get_stock_fundamentals(ticker: str) -> dict:
    """Fetches cached price, fundamentals, and ratio data for a given ticker."""
    ticker = ticker.upper()
    stock = next((s for s in _stock_cache["data"] if s["ticker"] == ticker), None)
    if not stock:
        return {"error": f"Data for {ticker} not found in cache."}
    
    # Helper to safely return values
    def safe(val):
        return val if val is not None else "N/A"
    
    return {
        "ticker": stock["ticker"],
        "name": stock["name"],
        "sector": safe(stock.get("sector")),
        "industry": safe(stock.get("industry")),
        "price": safe(stock.get("price")),
        "change_pct": safe(stock.get("change_pct")),
        "market_cap": safe(stock.get("market_cap")),
        "pe_ratio": safe(stock.get("pe_ratio")),
        "forward_pe": safe(stock.get("forward_pe")),
        "eps": safe(stock.get("eps")),
        "dividend_yield": safe(stock.get("dividend_yield")),
        "beta": safe(stock.get("beta")),
        "volume": safe(stock.get("volume")),
        "avg_volume": safe(stock.get("avg_volume")),
        "fifty_two_week_high": safe(stock.get("fifty_two_week_high")),
        "fifty_two_week_low": safe(stock.get("fifty_two_week_low")),
        "profit_margin": safe(stock.get("profit_margin")),
        "operating_margin": safe(stock.get("operating_margin")),
    }



# ─── Tool 2 (new): Top Movers ───
def get_top_movers() -> dict:
    """Get the top 10 gainers and top 10 losers from today's US markets."""
    gainers = _movers_cache["data"].get("gainers", [])[:10]
    losers = _movers_cache["data"].get("losers", [])[:10]
    return {
        "gainers": [{"ticker": g.get("symbol", g.get("ticker")), "name": g.get("name", ""), "price": g.get("price", 0), "change_pct": g.get("changesPercentage", g.get("change_pct", 0))} for g in gainers],
        "losers": [{"ticker": l.get("symbol", l.get("ticker")), "name": l.get("name", ""), "price": l.get("price", 0), "change_pct": l.get("changesPercentage", l.get("change_pct", 0))} for l in losers],
    }

# ─── Tool 3 (new): Company News ───
def get_company_news(ticker: str, limit: int = 5) -> dict:
    """Get the latest news headlines for a specific company."""
    ticker = ticker.upper()
    # Filter news cache if you have per-ticker news, else use general news
    # For now, return general recent news
    recent = _news_cache["data"][:limit]
    return {
        "ticker": ticker,
        "headlines": [{"title": n["title"], "publisher": n["publisher"], "published": n["published"]} for n in recent],
    }

# ─── Tool Schemas ───
STOCK_TOOL_SCHEMA = {
    "name": "get_stock_fundamentals",
    "description": "Get comprehensive fundamental data for a US stock: price, daily change, P/E ratio, EPS, dividend yield, beta, market cap, 52-week range, margins, and volume. ALWAYS use this tool when the user asks about a specific company's price, valuation, or key metrics. Never invent these numbers.",
    "parameters": {
        "type": "object",
        "properties": {
            "ticker": {
                "type": "string",
                "description": "Stock ticker symbol, e.g. 'AAPL' or 'NVDA'."
            }
        },
        "required": ["ticker"],
    },
}

MOVERS_TOOL_SCHEMA = {
    "name": "get_top_movers",
    "description": "Get today's top 10 gainers and top 10 losers in US markets. Use this whenever the user asks about 'top gainers', 'top losers', 'market movers', or 'what's moving today'.",
    "parameters": {"type": "object", "properties": {}},
}

NEWS_TOOL_SCHEMA = {
    "name": "get_company_news",
    "description": "Get the latest news headlines for a specific company. Use when the user asks about recent news or announcements for a ticker.",
    "parameters": {
        "type": "object",
        "properties": {
            "ticker": {"type": "string", "description": "Stock ticker symbol, e.g. 'AAPL'."},
        },
        "required": ["ticker"],
    },
}