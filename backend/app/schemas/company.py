from pydantic import BaseModel

class CompanyBase(BaseModel):
    ticker: str
    name: str
    sector: str | None = None
    industry: str | None = None

class CompanyResponse(CompanyBase):
    id: int

    class Config:
        from_attributes = True