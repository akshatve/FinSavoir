from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.company import Company
from app.schemas.company import CompanyResponse

from app.services.market_data import (
    get_company_overview, 
    get_company_history, 
    get_company_financials, 
    get_company_statistics, 
    get_company_news,
    get_comparison_data, 
    get_comparison_history,
    get_market_indices,
    get_trending_stocks,
    get_trending_news,
    get_trending_videos,
    get_sector_fundamentals,
    get_latest_sec_filings,
)


# Add this new import:
from app.services.stock_cache import (
    get_cached_stocks,
    search_stocks,
    get_cached_movers,
    get_marquee_stocks,
    get_sector_companies,
    get_all_sectors
    )

from app.services.news_cache import get_paginated_news  # <-- Add

from app.services.filings_cache import get_paginated_filings, get_press_releases  # <-- Add



router = APIRouter(prefix="/companies", tags=["Companies"])

# 1. Search Route
@router.get("/search", response_model=List[CompanyResponse])
def search_companies(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    search_term = f"%{q}%"
    companies = db.query(Company).filter(
        (Company.ticker.ilike(search_term)) | 
        (Company.name.ilike(search_term))
    ).limit(10).all()
    return companies

# 2. THE OVERVIEW ROUTE (Connects to your function!)
@router.get("/overview/{ticker}")
def get_company(ticker: str):
    data = get_company_overview(ticker)
    return data

# 3. History Route
@router.get("/history/{ticker}")
def get_history(ticker: str, period: str = "1y"):
    data = get_company_history(ticker, period)
    return data

# 4. Financials Route
@router.get("/financials/{ticker}")
def get_financials(ticker: str, period: str = "annual"):
    data = get_company_financials(ticker, period)
    return data

# 5. Statistics Route
@router.get("/statistics/{ticker}")
def get_statistics(ticker: str):
    data = get_company_statistics(ticker)
    return data

# 6. News Route
@router.get("/news/{ticker}")
def get_news(ticker: str, timeframe: str = "7d"):
    data = get_company_news(ticker, timeframe)
    return data

# 7. Comparison Route
@router.get("/compare")
def compare_companies(t1: str, t2: str):
    data = get_comparison_data(t1, t2)
    return data

# 8. Comparison History Route
@router.get("/compare/history")
def compare_history(t1: str, t2: str, period: str = "1y"):
    data = get_comparison_history(t1, t2, period)
    return data


# 9. famous 6 us market stocks
@router.get("/dashboard/indices")
def get_indices():
    return get_market_indices()




# 11. get trending stocks
@router.get("/dashboard/trending")
def get_trending():
    return get_trending_stocks()



@router.get("/dashboard/trending-news")
def get_news_dashboard():
    return get_trending_news()


@router.get("/dashboard/trending-videos")
def get_videos():
    return get_trending_videos()




@router.get("/dashboard/sector-fundamentals")
def get_sectors():
    return get_sector_fundamentals()




@router.get("/dashboard/sec-filings")
def get_sec_filings():
    return get_latest_sec_filings()



# To this:
@router.get("/all-stocks")
def get_stocks(page: int = 1, limit: int = 20):
    return get_cached_stocks(page, limit)  # <-- Correct



@router.get("/search-stocks")
def search_stocks_route(q: str = "", page: int = 1, limit: int = 20):
    if not q or len(q.strip()) < 1:
        return get_cached_stocks(page, limit)
    return search_stocks(q.strip(), page, limit)



@router.get("/all-news")
def get_news(page: int = 1, limit: int = 10, category: str = "All", q: str = ""):
    return get_paginated_news(page, limit, category, q)




@router.get("/dashboard/movers")
def get_movers():
    return get_cached_movers()




@router.get("/all-filings")
def get_filings(page: int = 1, limit: int = 20, form_type: str = "All", q: str = ""):
    return get_paginated_filings(page, limit, form_type, q)



@router.get("/marquee-stocks")
def marquee_stocks():
    return get_marquee_stocks()




@router.get("/press-releases")
def press_releases(page: int = 1, limit: int = 20, q: str = ""):
    return get_press_releases(page, limit, q)




@router.get("/sector/{sector_name}")
def sector_companies(sector_name: str):
    return get_sector_companies(sector_name)



@router.get("/sectors/all")
def all_sectors():
    return get_all_sectors()