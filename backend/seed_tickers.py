from app.database import SessionLocal
from app.models.company import Company
from app.services.stock_cache import ALL_TICKERS

# Skip ETFs — they don't have financial filings
ETF_TICKERS = {"SPY", "QQQ", "DIA", "IWM", "VTI", "VOO"}

db = SessionLocal()
added = 0
skipped = 0

for ticker in ALL_TICKERS:
    if ticker in ETF_TICKERS:
        skipped += 1
        continue

    exists = db.query(Company).filter(Company.ticker == ticker).first()
    if exists:
        skipped += 1
        continue

    db.add(Company(ticker=ticker, name=ticker))
    added += 1

db.commit()
db.close()
print(f"Added {added} new companies. Skipped {skipped}.")