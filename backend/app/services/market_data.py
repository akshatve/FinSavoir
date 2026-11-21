import numpy as np
import pandas as pd
import yfinance as yf
import feedparser
import urllib.parse
import datetime
import requests
import threading
import time
from app.config import settings
from bs4 import BeautifulSoup # <-- Add this import at the top
from fastapi import HTTPException


def dividend_yield_from_info(info: dict):
    """Dividend yield as a fraction (0.0123 == 1.23%), or None.

    Yahoo's ``dividendYield`` field has been returned both as a fraction and as
    a percentage depending on the yfinance version, which made FinSavoir show
    yields 100x too large. Deriving it from the annual dividend and the price
    avoids the ambiguity; ``trailingAnnualDividendYield`` is a fraction.
    """
    rate = info.get("dividendRate")
    price = info.get("currentPrice") or info.get("regularMarketPrice")
    if isinstance(rate, (int, float)) and isinstance(price, (int, float)) and price > 0:
        return rate / price
    trailing = info.get("trailingAnnualDividendYield")
    if isinstance(trailing, (int, float)):
        return trailing
    return None




def get_company_overview(ticker: str):
    try:
        # Initialize the Ticker object
        stock = yf.Ticker(ticker)
        
        # .info returns a dictionary with all the fundamental data
        info = stock.info
        
        # If yfinance can't find the ticker, 'info' will be empty or missing 'symbol'
        if not info or 'symbol' not in info:
            raise HTTPException(status_code=404, detail="Company not found")

        # We only extract the data we need for the Overview page to keep it fast
        return {
            "ticker": info.get("symbol", ticker).upper(),
            "name": info.get("longName") or info.get("shortName", "Unknown"),
            "sector": info.get("sector", "N/A"),
            "industry": info.get("industry", "N/A"),
            "description": info.get("longBusinessSummary", "No description available."),
            "website": info.get("website", ""),
            
            # Price Data
            "current_price": info.get("currentPrice") or info.get("regularMarketPrice"),
            "previous_close": info.get("previousClose"),
            "open": info.get("open"),
            "day_high": info.get("dayHigh"),
            "day_low": info.get("dayLow"),
            "fifty_two_week_high": info.get("fiftyTwoWeekHigh"),
            "fifty_two_week_low": info.get("fiftyTwoWeekLow"),
            "volume": info.get("volume"),
            "average_volume": info.get("averageVolume"),
            
            # Key Statistics
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "forward_pe": info.get("forwardPE"),
            "eps": info.get("trailingEps"),
            "dividend_yield": info.get("dividendYield"),
            "beta": info.get("beta"),
        }
    except Exception as e:
        # If anything goes wrong (e.g., invalid ticker format), throw a 500 error
        raise HTTPException(status_code=500, detail=str(e))


def get_company_history(ticker: str, period: str = "1y"):
    try:
        stock = yf.Ticker(ticker)
        # Fetch historical data based on the requested period
        hist = stock.history(period=period)
        
        if hist.empty:
            raise HTTPException(status_code=404, detail="No historical data found")
        
        # Reset index to turn the date from the index into a column
        hist.reset_index(inplace=True)
        
        # Convert the 'Date' column to string format (YYYY-MM-DD) for the frontend
        hist['Date'] = hist['Date'].dt.strftime('%Y-%m-%d')
        
        # Convert to a list of dictionaries (JSON format)
        return hist[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']].to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_company_financials(ticker: str, period: str = "annual"):
    try:
        stock = yf.Ticker(ticker)
        
        if period == "quarterly":
            income_stmt = stock.quarterly_income_stmt
            balance_sheet = stock.quarterly_balance_sheet
            cashflow = stock.quarterly_cashflow
        else:
            income_stmt = stock.income_stmt
            balance_sheet = stock.balance_sheet
            cashflow = stock.cashflow

        # Bulletproof cleaner
        def clean_df(df):
            if df is None or df.empty:
                return {}
            
            # 1. Convert dates to strings
            new_columns = {}
            for col in df.columns:
                if isinstance(col, pd.Timestamp):
                    new_columns[col] = col.strftime('%Y-%m-%d')
                else:
                    new_columns[col] = str(col)
            df = df.rename(columns=new_columns)
            
            # 2. Replace inf with NaN, then fill NaN with 0 (or None)
            df = df.replace([float('inf'), float('-inf')], float('nan'))
            
            # 3. Convert to dict but clean out NaNs
            result = {}
            for index, row in df.iterrows():
                row_data = {}
                for col, val in row.items():
                    if pd.isna(val):
                        row_data[col] = None # JSON safe
                    else:
                        row_data[col] = float(val) # Ensure it's a standard Python float
                result[str(index)] = row_data
                
            return result

        return {
            "income_statement": clean_df(income_stmt),
            "balance_sheet": clean_df(balance_sheet),
            "cash_flow": clean_df(cashflow)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_company_statistics(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        
        if not info or 'symbol' not in info:
            raise HTTPException(status_code=404, detail="Company not found")

        # Helper function to safely calculate ratios and avoid division by zero
        def safe_ratio(numerator, denominator):
            if numerator is None or denominator is None or denominator == 0:
                return None
            return numerator / denominator

        return {
            "valuation": {
                "market_cap": info.get("marketCap"),
                "enterprise_value": info.get("enterpriseValue"),
                "pe_ratio": info.get("trailingPE"),
                "forward_pe": info.get("forwardPE"),
                "peg_ratio": info.get("pegRatio"),
                "price_to_sales": info.get("priceToSalesTrailing12Months"),
                "price_to_book": info.get("priceToBook"),
            },
            "profitability": {
                "profit_margin": info.get("profitMargins"),
                "operating_margin": info.get("operatingMargins"),
                "gross_margin": info.get("grossMargins"),
                "return_on_equity": info.get("returnOnEquity"),
                "return_on_assets": info.get("returnOnAssets"),
            },
            "financial_health": {
                "total_cash": info.get("totalCash"),
                "total_debt": info.get("totalDebt"),
                "debt_to_equity": info.get("debtToEquity"),
                "current_ratio": info.get("currentRatio"),
                "quick_ratio": info.get("quickRatio"),
            },
            "share_stats": {
                "shares_outstanding": info.get("sharesOutstanding"),
                "float_shares": info.get("floatShares"),
                "insider_holding": info.get("heldPercentInsiders"),
                "institutional_holding": info.get("heldPercentInstitutions"),
                "short_ratio": info.get("shortRatio"),
            },
            "dividends": {
                "dividend_rate": info.get("dividendRate"),
                "dividend_yield": dividend_yield_from_info(info),
                "payout_ratio": info.get("payoutRatio"),
                "ex_dividend_date": info.get("exDividendDate"),
            },
            "performance": {
                "fifty_two_week_high": info.get("fiftyTwoWeekHigh"),
                "fifty_two_week_low": info.get("fiftyTwoWeekLow"),
                "fifty_two_week_change": info.get("52WeekChange"),
                "beta": info.get("beta"),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_company_news(ticker: str, timeframe: str = "7d"):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        company_name = info.get("longName") or info.get("shortName") or ticker
        
        if timeframe == "live":
            when_param = "when:1h"
        elif timeframe == "1d":
            when_param = "when:1d"
        elif timeframe == "30d":
            when_param = "when:30d"
        else:
            when_param = "when:7d"
        
        query = urllib.parse.quote(f"{company_name} stock")
        url = f"https://news.google.com/rss/search?q={query}+{when_param}&hl=en-US&gl=US&ceid=US:en"
        
        feed = feedparser.parse(url)
        
        articles = []
        now = datetime.datetime.now(datetime.timezone.utc)
        
        for entry in feed.entries[:20]:
            title = entry.title
            publisher = "Google News"
            if " - " in title:
                parts = title.rsplit(" - ", 1)
                title = parts[0]
                publisher = parts[1]

            # Extract Description (Summary)
            description = ""
            if hasattr(entry, 'summary'):
                # Strip HTML tags from the summary using BeautifulSoup
                soup = BeautifulSoup(entry.summary, "html.parser")
                description = soup.get_text(separator=" ").strip()
                # Google News summaries usually just repeat the title. If so, leave it blank or trim.
                if description.startswith(title[:20]):
                    description = "Click to read the full article on the publisher's website."
                elif len(description) > 200:
                    description = description[:200] + "..."

            # Parse published date
            pub_date = entry.published_parsed
            if pub_date:
                dt = datetime.datetime(*pub_date[:6], tzinfo=datetime.timezone.utc)
                
                if timeframe == "live":
                    diff_hours = (now - dt).total_seconds() / 3600
                    if diff_hours > 2:
                        continue 
                
                diff_seconds = (now - dt).total_seconds()
                if diff_seconds < 3600:
                    time_ago = f"{int(diff_seconds // 60)} mins ago"
                elif diff_seconds < 86400:
                    time_ago = f"{int(diff_seconds // 3600)} hours ago"
                else:
                    time_ago = f"{int(diff_seconds // 86400)} days ago"
            else:
                time_ago = "Recently"

            articles.append({
                "title": title,
                "publisher": publisher,
                "link": entry.link,
                "published": time_ago,
                "description": description # <-- Add description
            })
            
        return articles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_comparison_data(ticker1: str, ticker2: str):
    try:
        def get_stats(ticker):
            stock = yf.Ticker(ticker)
            info = stock.info
            if not info or 'symbol' not in info:
                return None
            return {
                "ticker": info.get("symbol", ticker).upper(),
                "name": info.get("longName", ticker),
                "price": info.get("currentPrice") or info.get("regularMarketPrice"),
                "market_cap": info.get("marketCap"),
                "pe_ratio": info.get("trailingPE"),
                "eps": info.get("trailingEps"),
                "revenue": info.get("totalRevenue"),
                "profit_margin": info.get("profitMargins"),
                "dividend_yield": dividend_yield_from_info(info),
                "beta": info.get("beta"),
            }

        data1 = get_stats(ticker1)
        data2 = get_stats(ticker2)

        if not data1 or not data2:
            raise HTTPException(status_code=404, detail="One or both tickers not found")

        return {"company1": data1, "company2": data2}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_comparison_history(ticker1: str, ticker2: str, period: str = "1y"):
    try:
        stock1 = yf.Ticker(ticker1)
        stock2 = yf.Ticker(ticker2)

        hist1 = stock1.history(period=period)
        hist2 = stock2.history(period=period)

        if hist1.empty or hist2.empty:
            raise HTTPException(status_code=404, detail="Could not fetch history for one or both tickers")

        # We need to align the dates. Let's find the intersection of both dates.
        common_dates = hist1.index.intersection(hist2.index)
        hist1 = hist1.loc[common_dates]
        hist2 = hist2.loc[common_dates]

        # Calculate Total Return (%) starting from 0%
        start_price1 = hist1['Close'].iloc[0]
        start_price2 = hist2['Close'].iloc[0]

        result = []
        for date in common_dates:
            date_str = date.strftime('%Y-%m-%d')
            return1 = ((hist1.loc[date, 'Close'] - start_price1) / start_price1) * 100
            return2 = ((hist2.loc[date, 'Close'] - start_price2) / start_price2) * 100
            
            result.append({
                "Date": date_str,
                "Ticker1_Return": return1,
                "Ticker2_Return": return2
            })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_company_overview(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        financials = stock.financials
        balance_sheet = stock.balance_sheet
        cashflow = stock.cashflow
        
        if not info or 'symbol' not in info:
            raise HTTPException(status_code=404, detail="Company not found")

        # Helper to safely get current and previous year values and calculate YoY %
        def get_yoy(df, row_name):
            if df is None or df.empty or row_name not in df.index:
                return None, None
            
            # yfinance columns are dates. The first is the most recent year.
            current_val = df.loc[row_name].iloc[0] if len(df.columns) > 0 else None
            prev_val = df.loc[row_name].iloc[1] if len(df.columns) > 1 else None
            
            if pd.isna(current_val): current_val = None
            if pd.isna(prev_val): prev_val = None

            # Calculate % change
            change = None
            if current_val is not None and prev_val is not None and prev_val != 0:
                change = ((current_val - prev_val) / abs(prev_val)) * 100
                
            return current_val, change

        # Extract YoY data
        rev, rev_yoy = get_yoy(financials, "Total Revenue")
        ni, ni_yoy = get_yoy(financials, "Net Income")
        eps, eps_yoy = get_yoy(financials, "Diluted EPS")
        # Free cash flow is a cash-flow statement line, not an income one.
        fcf, fcf_yoy = get_yoy(cashflow, "Free Cash Flow")
        cash, cash_yoy = get_yoy(balance_sheet, "Cash And Cash Equivalents")
        debt, debt_yoy = get_yoy(balance_sheet, "Total Debt")
        equity, equity_yoy = get_yoy(balance_sheet, "Stockholders Equity")
        
        # Get the fiscal year for the header
        fiscal_year = "Latest Period"
        if financials is not None and not financials.empty:
            latest_date = financials.columns[0]
            fiscal_year = f"Fiscal year {latest_date.year}"

        return {
            "ticker": info.get("symbol", ticker).upper(),
            "name": info.get("longName") or info.get("shortName", "Unknown"),
            "sector": info.get("sector", "N/A"),
            "industry": info.get("industry", "N/A"),
            "description": info.get("longBusinessSummary", "No description available."),
            "website": info.get("website", ""),
            "fiscal_year": fiscal_year,
            "exchange": info.get("fullExchangeName") or info.get("exchange"),
            
            # Price Data
            "current_price": info.get("currentPrice") or info.get("regularMarketPrice"),
            "previous_close": info.get("previousClose"),
            
            # Key Figures with YoY Changes
            "revenue": rev, "revenue_yoy": rev_yoy,
            "net_income": ni, "net_income_yoy": ni_yoy,
            "eps": eps, "eps_yoy": eps_yoy,
            "operating_margin": info.get("operatingMargins"), "operating_margin_yoy": None, # Info doesn't give this easily
            "free_cash_flow": fcf, "free_cash_flow_yoy": fcf_yoy,
            "total_cash": cash, "total_cash_yoy": cash_yoy,
            "total_debt": debt, "total_debt_yoy": debt_yoy,
            "equity": equity, "equity_yoy": equity_yoy,
            
            # Extra Stats
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "forward_pe": info.get("forwardPE"),
            "dividend_yield": dividend_yield_from_info(info),
            "beta": info.get("beta"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# get the top movers and top loosers 
def get_market_indices():
    indices = {
        "SPY": {"name": "S&P 500", "ticker": "^GSPC"},
        "QQQ": {"name": "NASDAQ", "ticker": "^IXIC"},
        "DIA": {"name": "Dow Jones", "ticker": "^DJI"},
        "TNX": {"name": "10-Yr Treasury", "ticker": "^TNX"}
    }
    
    results = []
    for key, data in indices.items():
        try:
            stock = yf.Ticker(data["ticker"])
            hist = stock.history(period="2d")
            if len(hist) >= 2:
                current = hist['Close'].iloc[-1]
                prev = hist['Close'].iloc[-2]
                change = current - prev
                change_pct = (change / prev) * 100
                results.append({
                    "name": data["name"],
                    "price": current,
                    "change": change,
                    "change_pct": change_pct
                })
        except Exception:
            continue
    return results


# to get top ganiers and top loosers
def get_top_movers():
    # Expanded list for better movers
    tickers = [
        "AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", "NFLX", "AMD", "INTC", 
        "BA", "JPM", "V", "WMT", "DIS", "PYPL", "SHOP", "UBER", "SQ", "COIN",
        "SOFI", "PLTR", "SNOW", "CRWD", "DDOG"
    ]
    
    movers = []
    for t in tickers:
        try:
            stock = yf.Ticker(t)
            hist = stock.history(period="5d")
            if len(hist) >= 2:
                current = hist['Close'].iloc[-1]
                prev = hist['Close'].iloc[-2]
                change_pct = ((current - prev) / prev) * 100
                info = stock.info
                movers.append({
                    "ticker": t,
                    "name": info.get("shortName", t),
                    "price": current,
                    "change_pct": change_pct,
                    "market_cap": info.get("marketCap", 0),
                    # Get 5-day sparkline for top cards
                    "sparkline": [round(p, 2) for p in hist['Close'].tolist()]
                })
        except Exception:
            continue
            
    gainers = sorted(movers, key=lambda x: x["change_pct"], reverse=True)[:10]
    losers = sorted(movers, key=lambda x: x["change_pct"])[:10]
    
    return {"gainers": gainers, "losers": losers}

# for 6 us stocks
def get_market_indices():
    indices = {
        "SPY": {"name": "E-Mini S&P 500", "ticker": "^GSPC"},
        "QQQ": {"name": "NASDAQ", "ticker": "^IXIC"},
        "DIA": {"name": "Mini Dow Jones", "ticker": "^DJI"},
        "RUT": {"name": "Russell 2000", "ticker": "^RUT"},    # <-- Added
        "VIX": {"name": "Volatility", "ticker": "^VIX"},      # <-- Added
        "TNX": {"name": "10-Yr Treasury", "ticker": "^TNX"}
    }
    
    results = []
    for key, data in indices.items():
        try:
            stock = yf.Ticker(data["ticker"])
            # Get last 10 days for the mini candlestick chart
            hist = stock.history(period="10d")
            if len(hist) >= 2:
                current = hist['Close'].iloc[-1]
                prev = hist['Close'].iloc[-2]
                change = current - prev
                change_pct = (change / prev) * 100
                
                # Extract OHLC data for candlesticks
                candles = []
                for date, row in hist.iterrows():
                    candles.append({
                        "open": round(row['Open'], 2),
                        "high": round(row['High'], 2),
                        "low": round(row['Low'], 2),
                        "close": round(row['Close'], 2),
                    })
                
                results.append({
                    "name": data["name"],
                    "price": round(current, 2),
                    "change": round(change, 2),
                    "change_pct": round(change_pct, 2),
                    "candles": candles # <-- Return Candles instead of sparkline
                })
        except Exception:
            continue
    return results

# to get the trending stocks
def get_trending_stocks():
    # In a real app, you'd pull this from your database (most viewed in last 24h)
    # Here we use a curated list of high-interest tickers
    trending_tickers = ["NVDA", "AAPL", "TSLA", "MSFT", "AMZN", "META", "GOOGL", "AMD"]
    
    results = []
    for ticker in trending_tickers:
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period="1mo")
            info = stock.info

            if len(hist) >= 2:
                current = hist['Close'].iloc[-1]
                prev = hist['Close'].iloc[-2]
                change_pct = ((current - prev) / prev) * 100
                
                # Real daily OHLC for the mini chart (last 15 sessions).
                candles = [
                    {
                        "open": round(float(row["Open"]), 2),
                        "high": round(float(row["High"]), 2),
                        "low": round(float(row["Low"]), 2),
                        "close": round(float(row["Close"]), 2),
                    }
                    for _, row in hist.tail(15).iterrows()
                ]
                sparkline = [c["close"] for c in candles[-5:]]
                
                results.append({
                    "ticker": ticker,
                    "name": info.get("shortName", ticker),
                    "price": round(current, 2),
                    "change_pct": round(change_pct, 2),
                    "sparkline": sparkline,
                    "candles": candles,
                    "volume": info.get("volume", 0)
                })
        except Exception:
            continue
            
    return results

# for trending news 
def get_trending_news():
    try:
        query = urllib.parse.quote("stock market finance")
        url = f"https://news.google.com/rss/search?q={query}+when:1d&hl=en-US&gl=US&ceid=US:en"
        
        feed = feedparser.parse(url)
        articles = []
        
        # CHANGE THIS FROM 5 TO 15
        for entry in feed.entries[:15]: 
            title = entry.title
            publisher = "Google News"
            if " - " in title:
                parts = title.rsplit(" - ", 1)
                title = parts[0]
                publisher = parts[1]

            description = ""
            if hasattr(entry, 'summary'):
                soup = BeautifulSoup(entry.summary, "html.parser")
                description = soup.get_text(separator=" ").strip()
                if len(description) > 150:
                    description = description[:150] + "..."

            articles.append({
                "title": title,
                "publisher": publisher,
                "link": entry.link,
                "description": description,
                "published": entry.published,
            })
            
        return articles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_trending_videos():
    try:
        # We are forcing the search to only look around New York City (Wall Street)
        # Coordinates for NYC: 40.7128, -74.0060
        url = "https://www.googleapis.com/youtube/v3/search"
        
        params = {
            "part": "snippet",
            "q": "stock market news",
            "type": "video",
            "order": "date",
            "maxResults": 6,
            "key": settings.YOUTUBE_API_KEY,
            "location": "40.7128,-74.0060", # <-- Wall Street Coordinates
            "locationRadius": "1000km",      # <-- Search within 1000km of NYC
            "relevanceLanguage": "en"
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        videos = []
        for item in data.get("items", []):
            videos.append({
                "id": item["id"]["videoId"],
                "title": item["snippet"]["title"],
                "channel": item["snippet"]["channelTitle"],
                "published": item["snippet"]["publishedAt"],
                "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
            })
            
        return videos
    except Exception as e:
        print(f"YouTube API Error: {e}")
        return []


def get_sector_fundamentals():
    sector_tickers = {
        "Technology": ["AAPL", "MSFT", "NVDA", "AVGO", "ORCL"],
        "Healthcare": ["LLY", "UNH", "JNJ", "ABBV", "MRK"],
        "Financials": ["JPM", "V", "MA", "BAC", "WFC"],
        "Consumer Discretionary": ["AMZN", "TSLA", "HD", "MCD", "NKE"],
        "Communication Services": ["GOOGL", "META", "DIS", "NFLX", "TMUS"],
        "Industrials": ["CAT", "GE", "HON", "UPS", "BA"],
        "Consumer Staples": ["PG", "KO", "PEP", "COST", "WMT"],
        "Energy": ["XOM", "CVX", "COP", "SLB", "EOG"],
    }

    results = []
    for sector, tickers in sector_tickers.items():
        revenues = []
        margins = []

        for ticker in tickers:
            try:
                stock = yf.Ticker(ticker)
                info = stock.info
                
                rev_growth = info.get("revenueGrowth")
                if rev_growth is not None and isinstance(rev_growth, (int, float)):
                    revenues.append(rev_growth * 100)
                
                op_margin = info.get("operatingMargins")
                if op_margin is not None and isinstance(op_margin, (int, float)):
                    margins.append(op_margin * 100)
            except Exception:
                continue
        
        # If we have enough data, add to results
        results.append({
            "sector": sector,
            "median_revenue_growth": round(float(np.median(revenues)), 2) if revenues else None,
            "median_operating_margin": round(float(np.median(margins)), 2) if margins else None,
            "company_count": len(margins),
        })
    
    return results

def get_latest_sec_filings():
    try:
        # SEC provides a free RSS feed of all latest filings
        # Adding a User-Agent is MANDATORY for SEC requests
        url = "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=&company=&dateb=&owner=include&count=10&output=atom"
        
        # SEC requires a User-Agent header to prevent bot blocking
        headers = {
            "User-Agent": "FinSavoir contact@finsavoir.com",
            "Accept-Encoding": "gzip, deflate",
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        feed = feedparser.parse(response.content)
        
        filings = []
        for entry in feed.entries[:6]: # Take top 6
            # The SEC Atom feed title looks like: "10-Q - APPLE INC (0000320193) (Filer)"
            raw_title = entry.title
            parts = raw_title.split(" - ")
            
            form_type = parts[0] if len(parts) > 0 else "Unknown"
            
            # Extract company name from the title
            company_name = parts[1].split(" (")[0] if len(parts) > 1 else "Unknown"
            
            # Format the date nicely
            published = entry.updated
            # Convert "2024-01-15T14:30:00-05:00" to "2 mins ago" style
            from datetime import datetime, timezone
            try:
                dt = datetime.fromisoformat(published.replace("Z", "+00:00"))
                now = datetime.now(timezone.utc)
                diff_seconds = (now - dt).total_seconds()
                
                if diff_seconds < 60:
                    time_ago = "Just now"
                elif diff_seconds < 3600:
                    time_ago = f"{int(diff_seconds // 60)}m ago"
                elif diff_seconds < 86400:
                    time_ago = f"{int(diff_seconds // 3600)}h ago"
                else:
                    time_ago = f"{int(diff_seconds // 86400)}d ago"
            except:
                time_ago = "Recently"
            
            filings.append({
                "form_type": form_type,
                "company": company_name,
                "time_ago": time_ago,
                "link": entry.link,
            })
        
        return filings
    except Exception as e:
        print(f"SEC Filings Error: {e}")
        return []





