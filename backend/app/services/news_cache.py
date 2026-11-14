import feedparser
import urllib.parse
import threading
import time
from datetime import datetime
from bs4 import BeautifulSoup

_news_cache = {
    "data": [],
    "last_updated": None,
    "is_loading": False,
}


def _parse_feed(url: str, category_override: str = None) -> list:
    """Helper to parse a single Google News RSS feed."""
    feed = feedparser.parse(url)
    articles = []

    for entry in feed.entries[:40]:
        title = entry.title
        publisher = "Google News"
        if " - " in title:
            parts = title.rsplit(" - ", 1)
            title = parts[0]
            publisher = parts[1]

        description = ""
        if hasattr(entry, "summary"):
            soup = BeautifulSoup(entry.summary, "html.parser")
            description = soup.get_text(separator=" ").strip()
            if len(description) > 200:
                description = description[:200] + "..."

        # Auto-categorize (unless overridden by caller)
        category = category_override or "Market"
        title_lower = title.lower()

        if category_override is None:
            if any(w in title_lower for w in ["tech", "ai", "apple", "google", "microsoft", "nvidia", "semiconductor"]):
                category = "Technology"
            elif any(w in title_lower for w in ["fed", "rate", "inflation", "bank", "treasury"]):
                category = "Finance"
            elif any(w in title_lower for w in ["oil", "energy", "opec", "gas"]):
                category = "Energy"
            elif any(w in title_lower for w in ["health", "pharma", "drug", "fda", "biotech", "medical", "hospital", "vaccine"]):
                category = "Healthcare"

        # Extract published timestamp for sorting
        pub_ts = 0
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            try:
                pub_ts = time.mktime(entry.published_parsed)
            except Exception:
                pub_ts = 0

        articles.append({
            "title": title,
            "publisher": publisher,
            "link": entry.link,
            "description": description,
            "published": entry.published if hasattr(entry, "published") else "Recently",
            "category": category,
            "_ts": pub_ts,  # internal for sorting
        })

    return articles


def _fetch_all_news():
    global _news_cache
    _news_cache["is_loading"] = True

    print("[NEWS CACHE] Fetching latest news...")
    start_time = time.time()

    try:
        all_articles = []

        # === 1. General market news ===
        market_query = urllib.parse.quote("US stock market news")
        market_url = f"https://news.google.com/rss/search?q={market_query}&hl=en-US&gl=US&ceid=US:en"
        all_articles.extend(_parse_feed(market_url))

        # === 2. Healthcare-specific news ===
        # This gives us plenty of healthcare stories even if general feed has few
        healthcare_query = urllib.parse.quote("healthcare pharma biotech stock market")
        healthcare_url = f"https://news.google.com/rss/search?q={healthcare_query}&hl=en-US&gl=US&ceid=US:en"
        all_articles.extend(_parse_feed(healthcare_url, category_override="Healthcare"))

        # === 3. Tech-specific news ===
        tech_query = urllib.parse.quote("technology stocks AI semiconductor market")
        tech_url = f"https://news.google.com/rss/search?q={tech_query}&hl=en-US&gl=US&ceid=US:en"
        all_articles.extend(_parse_feed(tech_url, category_override="Technology"))

        # === 4. Energy-specific news ===
        energy_query = urllib.parse.quote("oil energy stocks OPEC market")
        energy_url = f"https://news.google.com/rss/search?q={energy_query}&hl=en-US&gl=US&ceid=US:en"
        all_articles.extend(_parse_feed(energy_url, category_override="Energy"))

        # === 5. Finance-specific news ===
        finance_query = urllib.parse.quote("Federal Reserve banks financial market")
        finance_url = f"https://news.google.com/rss/search?q={finance_query}&hl=en-US&gl=US&ceid=US:en"
        all_articles.extend(_parse_feed(finance_url, category_override="Finance"))

        # === Deduplicate by title (case-insensitive) ===
        seen_titles = set()
        unique_articles = []
        for a in all_articles:
            key = a["title"].strip().lower()
            if key and key not in seen_titles:
                seen_titles.add(key)
                unique_articles.append(a)

        # === Sort by published timestamp (newest first) ===
        unique_articles.sort(key=lambda x: x.get("_ts", 0), reverse=True)

        # Remove the internal _ts field before caching
        for a in unique_articles:
            a.pop("_ts", None)

        _news_cache["data"] = unique_articles
        _news_cache["last_updated"] = datetime.now()

        elapsed = time.time() - start_time
        print(f"[NEWS CACHE] Fetched {len(unique_articles)} unique articles in {elapsed:.1f}s")

        # Print category counts for debugging
        counts = {}
        for a in unique_articles:
            counts[a["category"]] = counts.get(a["category"], 0) + 1
        print(f"[NEWS CACHE] Categories: {counts}")

    except Exception as e:
        print(f"[NEWS CACHE] Error: {e}")
    finally:
        _news_cache["is_loading"] = False


def _background_refresh_loop():
    while True:
        _fetch_all_news()
        time.sleep(10 * 60)  # 10 minutes


def start_news_cache():
    if not _news_cache["is_loading"] and not _news_cache["data"]:
        thread = threading.Thread(target=_background_refresh_loop, daemon=True)
        thread.start()


def get_paginated_news(page: int = 1, limit: int = 10, category: str = "All", query: str = ""):
    data = _news_cache["data"]

    if not data:
        return {
            "articles": [],
            "total_pages": 0,
            "total_articles": 0,
            "current_page": page,
            "is_loading": True,
        }

    filtered = data
    if category and category != "All":
        filtered = [a for a in filtered if a["category"] == category]

    if query:
        q = query.lower()
        filtered = [
            a for a in filtered
            if q in a["title"].lower() or q in a["description"].lower()
        ]

    start_index = (page - 1) * limit
    end_index = start_index + limit

    return {
        "articles": filtered[start_index:end_index],
        "total_pages": (len(filtered) + limit - 1) // limit if filtered else 0,
        "total_articles": len(filtered),
        "current_page": page,
        "is_loading": False,
    }