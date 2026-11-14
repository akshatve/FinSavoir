from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, UniqueConstraint, Text
from app.database import Base

class AnnualFinancial(Base):
    __tablename__ = "annual_financials"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    fiscal_year = Column(Integer, nullable=False)
    
    # Raw SEC Values
    revenue = Column(Float)
    operating_income = Column(Float)
    net_income = Column(Float)
    interest_expense = Column(Float)
    total_assets = Column(Float)
    total_liabilities = Column(Float)
    current_assets = Column(Float)
    current_liabilities = Column(Float)
    total_debt = Column(Float)
    operating_cash_flow = Column(Float)
    capex = Column(Float)
    free_cash_flow = Column(Float)
    diluted_shares = Column(Float)
    
    __table_args__ = (UniqueConstraint("company_id", "fiscal_year", name="uq_company_year"),)

class ProScoreCache(Base):
    __tablename__ = "pro_score_cache"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), unique=True, index=True)
    score_data = Column(Text)  # Stores the JSON string