from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import user, company
from app.routers import auth, users, companies, newsletter, contact, chat
from app.services.stock_cache import start_background_refresh, start_movers_cache
from app.services.news_cache import start_news_cache
from app.services.filings_cache import start_filings_cache  # <-- Add
from app.routers import pro_score
from app.services.sec_cache import start_sec_cache   # <-- ADD THIS


Base.metadata.create_all(bind=engine)

app = FastAPI(title="FinSavoir API")


@app.on_event("startup")
def startup_event():
    start_background_refresh()
    start_movers_cache()      # <-- ADD THIS (was missing!)
    start_news_cache()
    start_filings_cache()  # <-- Add
    start_sec_cache() 



app.include_router(auth.router)
app.include_router(users.router)
app.include_router(companies.router)
app.include_router(newsletter.router)
app.include_router(contact.router)
app.include_router(chat.router)
app.include_router(pro_score.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://finsavoir.com",
        "https://www.finsavoir.com",
    ],    
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the FinSavoir API"}