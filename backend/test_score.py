from app.database import SessionLocal
from app.models.company import Company
from app.models.financials import AnnualFinancial

db = SessionLocal()

# 1. Create a fake company
company = db.query(Company).filter(Company.ticker == "TEST").first()
if not company:
    company = Company(ticker="TEST", name="Test Corp", sector="Technology")
    db.add(company)
    db.commit()
    db.refresh(company)

# 2. Add 3 years of fake financials
years = [2023, 2024, 2025]
for yr in years:
    # Check if exists
    fin = db.query(AnnualFinancial).filter_by(company_id=company.id, fiscal_year=yr).first()
    if not fin:
        fin = AnnualFinancial(
            company_id=company.id,
            fiscal_year=yr,
            revenue=1000000,
            operating_income=150000,
            net_income=100000,
            total_assets=500000,
            total_liabilities=200000,
            current_assets=250000,
            current_liabilities=100000,
            total_debt=50000,
            operating_cash_flow=120000,
            free_cash_flow=80000
        )
        db.add(fin)

db.commit()
print("Fake data inserted!")
db.close()