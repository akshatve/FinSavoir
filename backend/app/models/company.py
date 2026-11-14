from sqlalchemy import Column, Integer, String
from app.database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    sector = Column(String)
    industry = Column(String)

     # ADD THIS LINE:
    cik = Column(String, index=True, nullable=True) 