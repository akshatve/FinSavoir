import yfinance as yf
import threading
import time
import requests
from app.config import settings
from datetime import datetime

# Global in-memory cache
_stock_cache = {
    "data": [],
    "last_updated": None,
    "is_loading": False,
}

# List of all US stocks to track (S&P 500)
ALL_TICKERS = [
    # ============ TECHNOLOGY (70) ============
    "AAPL", "MSFT", "NVDA", "GOOGL", "META", "AVGO", "ORCL", "CRM", "ADBE", "AMD",
    "INTC", "QCOM", "TXN", "MU", "AMAT", "INTU", "NOW", "PANW", "SNOW", "CRWD",
    "CSCO", "IBM", "ACN", "ANET", "ADI", "KLAC", "LRCX", "MRVL", "MCHP", "ON",
    "NXPI", "MPWR", "SWKS", "QRVO", "TER", "KEYS", "FTNT", "ZS", "OKTA", "TEAM",
    "WDAY", "ADSK", "SNPS", "CDNS", "ANSS", "PTC", "TYL", "EPAM", "CTSH", "IT",
    "GLW", "APH", "TEL", "MSI", "JBL", "STX", "WDC", "NTAP", "PSTG", "HPQ",
    "DELL", "SMCI", "GDDY", "AKAM", "FFIV", "GEN", "VRSN", "PAYC", "PAYX", "DAY",

    # ============ COMMUNICATION (30) ============
    "DIS", "NFLX", "CMCSA", "T", "VZ", "TMUS", "CHTR", "EA", "TTWO", "ATVI",
    "WBD", "PARA", "FOXA", "FOX", "NWSA", "NWS", "OMC", "IPG", "MTCH", "ZG",
    "GOOG", "LYV", "MTCH", "NWS", "SPOT", "ROKU", "PINS", "SNAP", "TTD", "APP",

    # ============ CONSUMER DISCRETIONARY (55) ============
    "AMZN", "TSLA", "HD", "MCD", "NKE", "SBUX", "TGT", "LOW", "BKNG", "MAR",
    "F", "GM", "EBAY", "ETSY", "ABNB", "DASH", "UBER", "LYFT", "COST", "WMT",
    "LULU", "ROST", "TJX", "BURL", "YUM", "CMG", "DPZ", "DRI", "LVS", "WYNN",
    "MGM", "RCL", "CCL", "NCLH", "EXPE", "H", "HLT", "MAR", "RCL", "CZR",
    "DG", "DLTR", "DLTR", "BBY", "KMX", "AN", "GRMN", "POOL", "ULTA", "DECK",
    "TPR", "RL", "LEN", "DHI", "PHM", "NVR",

    # ============ CONSUMER STAPLES (38) ============
    "PG", "KO", "PEP", "PM", "MO", "CL", "EL", "KMB", "GIS", "K",
    "HSY", "MDLZ", "STZ", "BF.B", "TAP", "YUM", "COST", "WMT", "TGT", "KR",
    "SYY", "ADM", "TSN", "HRL", "CPB", "CAG", "SJM", "MKC", "CLX", "CHD",
    "CL", "KMB", "KHC", "CAG", "WBA", "CVS", "KR", "BJ",

    # ============ FINANCIALS (70) ============
    "JPM", "V", "MA", "BAC", "WFC", "MS", "GS", "C", "BLK", "SCHW",
    "AXP", "USB", "PNC", "TFC", "COF", "BK", "STT", "FITB", "HBAN", "RF",
    "KEY", "CFG", "MTB", "ZION", "FRC", "SIVB", "ALLY", "DFS", "SYF", "MET",
    "PRU", "AFL", "AIG", "ALL", "TRV", "PGR", "CB", "MMC", "AON", "AJG",
    "BRK.B", "SPGI", "MCO", "ICE", "CME", "NDAQ", "CBOE", "MSCI", "FDS", "MKTX",
    "V", "MA", "PYPL", "FIS", "FI", "GPN", "JKHY", "BR", "PAYX", "WU",
    "CME", "CBOE", "RJF", "SCHW", "LPLA", "IBKR", "EVR", "HLI", "PJT", "MKTX",

    # ============ HEALTHCARE (65) ============
    "LLY", "UNH", "JNJ", "ABBV", "MRK", "PFE", "TMO", "ABT", "DHR", "BMY",
    "AMGN", "GILD", "CVS", "MDT", "ISRG", "SYK", "ZTS", "REGN", "VRTX", "BIIB",
    "ILMN", "MRNA", "BNTX", "NVAX", "HOLX", "IDXX", "IQV", "CRL", "A", "WAT",
    "ZBH", "BSX", "EW", "BAX", "BDX", "CI", "HUM", "CNC", "MOH", "ELV",
    "HCA", "MCK", "ABC", "CAH", "HOLX", "DVA", "UHS", "THC", "EHC", "AMED",
    "VTRS", "OGN", "PRGO", "JAZZ", "ALNY", "BMRN", "SGEN", "EXAS", "NVCR", "RGEN",

    # ============ ENERGY (25) ============
    "XOM", "CVX", "COP", "SLB", "EOG", "PXD", "MPC", "PSX", "VLO", "OXY",
    "HAL", "BKR", "DVN", "FANG", "MRO", "APA", "CTRA", "OKE", "WMB", "KMI",
    "ET", "EPD", "MPLX", "PAA", "TRGP",

    # ============ INDUSTRIALS (50) ============
    "CAT", "GE", "HON", "UPS", "BA", "LMT", "RTX", "DE", "MMM", "FDX",
    "GD", "NOC", "LHX", "EMR", "ETN", "PH", "ROK", "CMI", "PCAR", "CSX",
    "UNP", "NSC", "WM", "RSG", "ITW", "DOV", "IR", "XYL", "GNRC", "OTIS",
    "CARR", "TT", "JCI", "CMI", "PCAR", "FAST", "GWW", "PWR", "URI", "SWK",
    "SNA", "MAS", "ALLE", "AOS", "RBC", "EXPD", "CHRW", "ODFL", "XPO", "WAB",

    # ============ MATERIALS (20) ============
    "LIN", "APD", "SHW", "ECL", "DD", "NEM", "FCX", "VMC", "MLM", "PPG",
    "IFF", "CE", "ALB", "DOW", "LYB", "CTVA", "FMC", "MOS", "IP", "PKG",

    # ============ REAL ESTATE (20) ============
    "AMT", "PLD", "CCI", "EQIX", "SPG", "O", "WELL", "DLR", "PSA", "AVB",
    "EQR", "VTR", "ARE", "BXP", "VNO", "SBAC", "IRM", "EXR", "CUBE", "MAA",

    # ============ UTILITIES (20) ============
    "NEE", "DUK", "SO", "D", "AEP", "EXC", "XEL", "SRE", "PEG", "ED",
    "EIX", "PCG", "WEC", "ES", "AEE", "DTE", "PPL", "CMS", "CNP", "LNT",

    # ============ ETFs (6) ============
    "SPY", "QQQ", "DIA", "IWM", "VTI", "VOO"
]


def _fetch_all_stocks():
    """Fetches all stocks in batches and updates the cache."""
    global _stock_cache
    _stock_cache["is_loading"] = True
    
    all_data = []
    print(f"[CACHE] Starting stock fetch for {len(ALL_TICKERS)} tickers...")
    start_time = time.time()
    
    # Fetch in batches of 10 to avoid rate limiting
    for i in range(0, len(ALL_TICKERS), 10):
        batch = ALL_TICKERS[i:i+10]
        for ticker in batch:
            try:
                stock = yf.Ticker(ticker)
                info = stock.info
                hist = stock.history(period="2d")
                
                if len(hist) >= 2 and info:
                    current = hist['Close'].iloc[-1]
                    prev = hist['Close'].iloc[-2]
                    change_pct = ((current - prev) / prev) * 100
                    
                    all_data.append({
                        "ticker": ticker,
                        "name": info.get("shortName", ticker),
                        "sector": info.get("sector", "N/A"),
                        "industry": info.get("industry", "N/A"),
                        "market_cap": info.get("marketCap", 0),
                        "price": current,
                        "change_pct": change_pct,
                        "prev_close": prev,
                        "pe_ratio": info.get("trailingPE"),
                        "forward_pe": info.get("forwardPE"),
                        "eps": info.get("trailingEps"),
                        "dividend_yield": info.get("dividendYield"),
                        "beta": info.get("beta"),
                        "volume": info.get("volume"),
                        "avg_volume": info.get("averageVolume"),
                        "fifty_two_week_high": info.get("fiftyTwoWeekHigh"),
                        "fifty_two_week_low": info.get("fiftyTwoWeekLow"),
                        "profit_margin": info.get("profitMargins"),
                        "operating_margin": info.get("operatingMargins"),
                    })
            except Exception:
                continue
        
        # Small delay between batches to be polite to Yahoo Finance
        time.sleep(0.2)
    
    # Sort by market cap descending
    all_data.sort(key=lambda x: x.get("market_cap") or 0, reverse=True)
    
    _stock_cache["data"] = all_data
    _stock_cache["last_updated"] = datetime.now()
    _stock_cache["is_loading"] = False
    
    elapsed = time.time() - start_time
    print(f"[CACHE] Fetched {len(all_data)} stocks in {elapsed:.1f}s")


def _background_refresh_loop():
    """Refreshes the cache every 15 minutes."""
    while True:
        _fetch_all_stocks()
        time.sleep(15 * 60)  # 15 minutes


def start_background_refresh():
    """Call this on app startup to kick off the background thread."""
    if not _stock_cache["is_loading"] and not _stock_cache["data"]:
        thread = threading.Thread(target=_background_refresh_loop, daemon=True)
        thread.start()


def get_cached_stocks(page: int = 1, limit: int = 20):
    """Returns a paginated slice of the cached data."""
    data = _stock_cache["data"]
    
    if not data:
        return {
            "stocks": [],
            "total_pages": 0,
            "total_stocks": 0,
            "current_page": page,
            "is_loading": True,
        }
    
    start_index = (page - 1) * limit
    end_index = start_index + limit
    
    return {
        "stocks": data[start_index:end_index],
        "total_pages": (len(data) + limit - 1) // limit,
        "total_stocks": len(data),
        "current_page": page,
        "is_loading": False,
        "last_updated": _stock_cache["last_updated"].isoformat() if _stock_cache["last_updated"] else None,
    }


def search_stocks(query: str, page: int = 1, limit: int = 20):
    """Search across ALL cached stocks, then paginate the results."""
    data = _stock_cache["data"]
    
    if not data:
        return {
            "stocks": [],
            "total_pages": 0,
            "total_stocks": 0,
            "current_page": page,
            "is_loading": True,
        }
    
    query_lower = query.lower()
    filtered = [
        s for s in data 
        if query_lower in s["ticker"].lower() 
        or query_lower in s["name"].lower() 
        or query_lower in s["sector"].lower()
    ]
    
    start_index = (page - 1) * limit
    end_index = start_index + limit
    
    return {
        "stocks": filtered[start_index:end_index],
        "total_pages": (len(filtered) + limit - 1) // limit if filtered else 0,
        "total_stocks": len(filtered),
        "current_page": page,
        "is_loading": False,
    }

# ================= MARKET MOVERS CACHE =================
_movers_cache = {
    "data": {"gainers": [], "losers": []},
    "last_updated": None,
    "is_loading": False,
}

def _fetch_movers():
    global _movers_cache
    
    if _movers_cache["last_updated"]:
        elapsed_since_last = (datetime.now() - _movers_cache["last_updated"]).total_seconds()
        if elapsed_since_last < 5 * 60 and _movers_cache["data"]["gainers"]:
            return
    
    _movers_cache["is_loading"] = True
    
    try:
        gainers_url = f"https://financialmodelingprep.com/stable/biggest-gainers?apikey={settings.FMP_API_KEY}"
        losers_url = f"https://financialmodelingprep.com/stable/biggest-losers?apikey={settings.FMP_API_KEY}"
        
        gainers_res = requests.get(gainers_url, timeout=10)
        losers_res = requests.get(losers_url, timeout=10)
        
        if gainers_res.status_code in (401, 403, 429):
            return
        
        gainers_data = gainers_res.json()
        losers_data = losers_res.json()
        
        if isinstance(gainers_data, list) and isinstance(losers_data, list):
            _movers_cache["data"] = {
                "gainers": gainers_data[:10],
                "losers": losers_data[:10],
            }
            _movers_cache["last_updated"] = datetime.now()
    
    except Exception as e:
        print(f"[MOVERS CACHE] EXCEPTION: {e}")
    
    finally:
        _movers_cache["is_loading"] = False

def _movers_refresh_loop():
    while True:
        try:
            _fetch_movers()
        except Exception as e:
            print(f"[MOVERS CACHE] Loop error: {e}")
        time.sleep(15 * 60)

def start_movers_cache():
    if not _movers_cache["is_loading"] and not _movers_cache["data"]["gainers"]:
        thread = threading.Thread(target=_movers_refresh_loop, daemon=True)
        thread.start()

def get_cached_movers():
    return _movers_cache["data"]

def get_marquee_stocks():
    data = _stock_cache["data"]
    if not data:
        return []
    
    famous_tickers = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "NFLX", "AMD", "DIS"]
    
    result = []
    for ticker in famous_tickers:
        stock = next((s for s in data if s["ticker"] == ticker), None)
        if stock:
            result.append({
                "ticker": stock["ticker"],
                "name": stock["name"],
                "price": stock["price"],
                "change_pct": stock["change_pct"],
            })
    
    return result

def get_sector_companies(sector: str):
    data = _stock_cache["data"]
    
    if not data:
        return {"companies": [], "total": 0, "is_loading": True}
    
    SECTOR_ALIASES = {
        "Information Technology": "Technology",
        "Financial Services": "Financials",
        "Health Care": "Healthcare",
        "Consumer Cyclical": "Consumer Discretionary",
        "Consumer Defensive": "Consumer Staples",
        "Basic Materials": "Materials",
    }
    
    sector_lower = sector.lower()
    companies = []
    
    for s in data:
        raw_sector = s.get("sector", "")
        normalized = SECTOR_ALIASES.get(raw_sector, raw_sector)
        
        if normalized.lower() == sector_lower:
            companies.append({
                "ticker": s["ticker"],
                "name": s["name"],
                "sector": normalized,
                "industry": s.get("industry", "N/A"),
                "price": s.get("price"),
                "change_pct": s.get("change_pct"),
                "market_cap": s.get("market_cap"),
                "pe_ratio": s.get("pe_ratio"),
                "eps": s.get("eps"),
                "dividend_yield": s.get("dividend_yield"),
                "beta": s.get("beta"),
            })
    
    companies.sort(key=lambda x: x.get("market_cap") or 0, reverse=True)
    
    return {
        "companies": companies,
        "total": len(companies),
        "is_loading": False,
    }


def get_all_sectors():
    data = _stock_cache["data"]
    if not data:
        return []
    
    SECTOR_ALIASES = {
        "Information Technology": "Technology",
        "Financial Services": "Financials",
        "Health Care": "Health care",
        "Consumer Cyclical": "Consumer Discretionary",
        "Consumer Defensive": "Consumer Staples",
        "Basic Materials": "Materials",
        "Communication Services": "Communication Services",
    }
    
    sectors = {}
    for s in data:
        sector = s.get("sector", "N/A")
        if not sector or sector == "N/A":
            continue
        sector = SECTOR_ALIASES.get(sector, sector)
        sectors[sector] = sectors.get(sector, 0) + 1
    
    return [
        {"name": name, "count": count}
        for name, count in sorted(sectors.items(), key=lambda x: -x[1])
    ]