from app.database import SessionLocal
from app.models.company import Company

db = SessionLocal()

companies = [
    Company(ticker="AAPL", name="Apple Inc.", sector="Technology", industry="Consumer Electronics"),
    Company(ticker="MSFT", name="Microsoft Corporation", sector="Technology", industry="Software"),
    Company(ticker="GOOGL", name="Alphabet Inc.", sector="Technology", industry="Internet Content"),
    Company(ticker="TSLA", name="Tesla, Inc.", sector="Consumer Cyclical", industry="Auto Manufacturers"),
    Company(ticker="AMZN", name="Amazon.com, Inc.", sector="Consumer Cyclical", industry="Internet Retail"),
    Company(ticker="NVDA", name="NVIDIA Corporation", sector="Technology", industry="Semiconductors"),
    Company(ticker="META", name="Meta Platforms, Inc.", sector="Technology", industry="Internet Content"),
]

for c in companies:
    # Check if it already exists to avoid duplicates
    if not db.query(Company).filter(Company.ticker == c.ticker).first():
        db.add(c)

db.commit()
print(f"Added {len(companies)} companies to the database!")
db.close()