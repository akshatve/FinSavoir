from app.database import SessionLocal
from app.models.company import Company
from app.models.financials import AnnualFinancial

db = SessionLocal()

print(f"{'TICKER':<8} {'NAME':<25} {'YEARS':<7} {'STATUS'}")
print("=" * 60)

with_data = []
without_data = []

for company in db.query(Company).order_by(Company.ticker).all():
    years = db.query(AnnualFinancial).filter(
        AnnualFinancial.company_id == company.id
    ).count()

    if years >= 3:
        status = "✓ OK"
        with_data.append(company.ticker)
    elif years > 0:
        status = f"⚠ Only {years} yr (need 3)"
        without_data.append(company.ticker)
    else:
        status = "✗ No data"
        without_data.append(company.ticker)

    print(f"{company.ticker:<8} {(company.name or '')[:24]:<25} {years:<7} {status}")

db.close()

print("\n" + "=" * 60)
print(f"✓ Ready ({len(with_data)}):  {', '.join(with_data)}")
print(f"\n✗/⚠ Missing ({len(without_data)}): {', '.join(without_data)}")