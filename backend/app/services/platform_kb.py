PLATFORM_KB = {
    "free": "Yes, FinSavoir is completely free. No credit card, no signup required to browse.",
    "cost": "FinSavoir is 100% free. No subscription, no credit card.",
    "signup": "Register at /register with a 3-step email verification (email → OTP → password). Accounts unlock watchlists and recently viewed history.",
    "register": "Register at /register. We verify your email via OTP, then you set a password.",
    "login": "Log in at /login with your email and password.",
    "watchlist": "Click the bookmark icon on any company page to add it to your watchlist. Open the watchlist from the bookmark icon in the navbar. No login required.",
    "compare": "Go to any company page and click the Compare tab. Enter another ticker to see side-by-side metrics.",
    "filings": "All SEC filings are at /filings. Filter by 10-K, 10-Q, 8-K, or Form 4. Click any filing to open it on SEC EDGAR.",
    "news": "Company news is on each company page's News tab. General market news is at /news.",
    "data source": "Prices come from Yahoo Finance, movers from FMP, filings from SEC EDGAR, and news from Google News.",
    "real time": "Near real-time. Prices cache for 15 minutes and filings refresh every 5 minutes.",
    "ticker": "Just type any US ticker in the search bar (e.g., AAPL, NVDA) to open its research page.",
    "search": "Use the search bar in the navbar. It has Trending and Recent Searches tabs.",
    "sector": "Sector fundamentals are shown on the homepage as a color-coded heatmap.",
    "chart": "Each company page has a Chart tab with TradingView candlestick charts (1D to 5Y).",
    "financials": "The Financials tab shows income statement, balance sheet, and cash flow (annual and quarterly).",
    "statistics": "The Statistics tab shows valuation, profitability, health, and dividend metrics.",
    "profile": "Your profile page shows account info, watchlist summary, and recently viewed companies.",
}

PLATFORM_KEYWORDS = [
    "finsavoir", "platform", "watchlist", "signup", "register", "login",
    "free", "cost", "price of the platform", "features", "how do i",
    "how does", "compare tab", "filings page", "how to use",
    "what is finsavoir", "what can you do",
]

def is_platform_question(msg: str) -> bool:
    msg_lower = msg.lower()
    return any(kw in msg_lower for kw in PLATFORM_KEYWORDS)

def lookup_platform_faq(msg: str) -> str:
    msg_lower = msg.lower()
    # Find the best matching key
    for key, answer in PLATFORM_KB.items():
        if key in msg_lower:
            return answer
    # Fallback to a generic answer
    return (
        "FinSavoir is a free stock research platform. Key features: browse 100+ US stocks, "
        "view financial statements and SEC filings, compare companies side-by-side, and save "
        "watchlists. Which feature would you like to know more about?"
    )