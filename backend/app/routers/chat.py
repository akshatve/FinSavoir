from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from openai import OpenAI
import json
import re
import asyncio
from app.config import settings
from app.services.chat_tools import get_stock_fundamentals, get_top_movers, get_company_news
from app.services.platform_kb import lookup_platform_faq, is_platform_question

router = APIRouter(prefix="/chat", tags=["Chat"])
client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=settings.GROQ_API_KEY)

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

COMPANY_NAME_MAP = {
    "apple": "AAPL", "microsoft": "MSFT", "nvidia": "NVDA",
    "amd": "AMD", "advanced micro devices": "AMD",
    "tesla": "TSLA", "amazon": "AMZN", "google": "GOOGL",
    "alphabet": "GOOGL", "meta": "META", "facebook": "META",
    "netflix": "NFLX", "intel": "INTC", "boeing": "BA",
    "jpmorgan": "JPM", "visa": "V", "walmart": "WMT",
    "disney": "DIS", "paypal": "PYPL", "uber": "UBER",
}

SYSTEM_PROMPT = """You are FinSavoir AI, an AI assistant built ONLY for stock market research and questions about the FinSavoir platform.

ABOUT FINSAVOIR:
FinSavoir is a free, US-focused financial research platform built around SEC filings.
- 100+ US companies available for research
- Free to browse without an account
- Near real-time data (prices cache 15 min, filings refresh every 5 min)
- Data sources: Yahoo Finance (prices), FMP (movers), SEC EDGAR (filings), Google News (news)

PAGES:
- / (homepage: market ticker, trending stocks, movers, news, sector heatmap, SEC filings)
- /stocks (browse all 100+ US stocks with search)
- /markets (top 10 gainers and losers)
- /news (general market news, categorized)
- /filings (real-time SEC filings, color-coded by form)
- /press-releases (8-K filings only)
- /company/[ticker] (full research: Overview, Financials, Chart, Statistics, News, Compare)
- /profile (account info, watchlist summary, recently viewed)
- /register (3-step email verification)
- /login

FEATURES:
- Watchlist (bookmark icon in navbar, no login required)
- Compare stocks (tab on any company page)
- SEC filings searchable by form type
- Company news with Live/24h/7d/30d filters
- Financial statements (income, balance, cash flow) annual and quarterly
- Candlestick charts (TradingView) with filing markers

RULES:
1. NEVER invent prices, percentages, or stock data. Use tools.
2. Always use provided REAL-TIME DATA to answer.
3. Keep responses concise and factual.
4. Do NOT give investment advice.
5. Never use markdown tables or pipe characters (|).
6. Answer questions about FinSavoir's own features clearly and helpfully.
7. For general knowledge (HTML, cooking, history, coding) → refuse politely.
8. For investment advice → refuse but offer data instead.

OFF-TOPIC REFUSAL:
"I'm FinSavoir AI — I specialize only in stock market research and the FinSavoir platform. I can't help with that, but I can look up stock prices, compare companies, or explain any FinSavoir feature. What would you like to explore?"

INVESTMENT ADVICE REFUSAL:
"I can't give investment advice. But I can give you the data to decide for yourself — for example, the stock's current price, P/E ratio, margins, and recent news. Would you like me to pull that up?"

FORMAT for top gainers/losers (blank line between each):
**1. VCIG** — VCI Global Limited
+1,451.12% · $3.04

**2. RETO** — ReTo Eco-Solutions
+613.15% · $4.45

FORMAT for comparisons:
**NVDA**
- Profit margin: 63.66%
- Operating margin: 66.24%

**AMD**
- Profit margin: 15.58%
- Operating margin: 17.25%

Stay in your lane. Be professional and concise.
"""

OFF_TOPIC_KEYWORDS = [
    "html", "css", "javascript", "python", "coding", "program",
    "recipe", "cook", "history", "science", "geography", "poem", "essay",
    "translate", "homework", "math problem", "physics", "chemistry",
    "movie", "song", "lyrics", "joke", "story", "weather",
    "how to make", "how to write", "how to fix",
    "what is html", "what is css", "what is javascript",
]

INVESTMENT_ADVICE_KEYWORDS = [
    "should i buy", "should i invest", "should i sell",
    "is it a good investment", "is it a good buy",
    "will it go up", "will it go down",
    "recommend me a stock", "which stock should i buy",
    "give me investment advice",
]

def get_instant_response(user_message: str) -> str:
    """Returns an instant response for platform FAQs, off-topic, or advice questions."""
    msg = user_message.lower().strip()
    
    # 1. Platform FAQ (Level 2)
    if is_platform_question(msg):
        faq_answer = lookup_platform_faq(msg)
        if faq_answer:
            return faq_answer
    
    # 2. Investment advice refusal
    for keyword in INVESTMENT_ADVICE_KEYWORDS:
        if keyword in msg:
            ticker = "the stock"
            for name, t in COMPANY_NAME_MAP.items():
                if name in msg:
                    ticker = t
                    break
            else:
                for match in re.findall(r'\b[A-Z]{2,5}\b', user_message):
                    if match not in {"I", "A", "IS", "IT", "AT", "IN", "TO", "ON", "OF", "OR"}:
                        ticker = match
                        break
            
            return (
                f"I can't give investment advice. But I can give you the data to decide for yourself — "
                f"for example, {ticker}'s current price, P/E ratio, margins, and recent news. "
                f"Would you like me to pull that up?"
            )
    
    # 3. Off-topic refusal
    for keyword in OFF_TOPIC_KEYWORDS:
        if keyword in msg:
            return (
                "I'm FinSavoir AI — I specialize only in stock market research and the FinSavoir platform. "
                "I can't help with that, but I can look up stock prices, compare companies, or explain any FinSavoir feature. "
                "What would you like to explore?"
            )
    
    return None

def detect_and_fetch_data(user_message: str) -> str:
    message_lower = user_message.lower()
    
    if any(kw in message_lower for kw in ["top gainers", "top losers", "movers", "what's moving"]):
        data = get_top_movers()
        return f"MARKET MOVERS DATA:\n{json.dumps(data)}\n\nUse this data to answer in the mandated bullet-card format."
    
    tickers = set()
    for match in re.findall(r'\b[A-Z]{2,5}\b', user_message):
        tickers.add(match)
    for name, ticker in COMPANY_NAME_MAP.items():
        if name in message_lower:
            tickers.add(ticker)
    
    STOPWORDS = {"I", "A", "IT", "IS", "AT", "IN", "TO", "ON", "OF", "OR", "AND", "THE", "FOR", "WITH"}
    tickers = tickers - STOPWORDS
    
    if not tickers:
        return ""
    
    wants_news = "news" in message_lower
    
    all_data = {}
    for ticker in tickers:
        try:
            if wants_news:
                all_data[ticker] = {"news": get_company_news(ticker)}
            else:
                all_data[ticker] = get_stock_fundamentals(ticker)
        except Exception as e:
            all_data[ticker] = {"error": str(e)}
    
    if not all_data:
        return ""
    
    context_lines = ["REAL-TIME DATA FROM FINSAVOIR CACHE:\n"]
    for ticker, data in all_data.items():
        context_lines.append(f"\n--- {ticker} ---")
        context_lines.append(json.dumps(data, indent=2))
    
    context_lines.append(
        "\n\nCRITICAL: Use ONLY the data above. NEVER use tables or pipe characters. "
        "Follow the mandated bullet-card format with blank lines between each item."
    )
    
    return "\n".join(context_lines)

@router.post("/stream")
async def chat_stream(request: ChatRequest):
    user_message = request.messages[-1].content
    
    instant = get_instant_response(user_message)
    
    async def generate():
        try:
            if instant:
                for i in range(0, len(instant), 4):
                    yield f"data: {instant[i:i+4]}\n\n"
                    await asyncio.sleep(0.01)
                yield "data: [DONE]\n\n"
                return
            
            data_context = detect_and_fetch_data(user_message)
            
            system_prompt = SYSTEM_PROMPT
            if data_context:
                system_prompt += f"\n\n{data_context}"
            
            messages = [{"role": "system", "content": system_prompt}]
            messages += [{"role": m.role, "content": m.content} for m in request.messages]
            
            stream = client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=messages,
                max_tokens=1500,
                temperature=0.3,
                stream=True,
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield f"data: {chunk.choices[0].delta.content}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")