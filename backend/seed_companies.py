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






# import yfinance as yf
# from app.database import SessionLocal
# from app.models.company import Company

# # List of all US stocks to track (S&P 500)
# ALL_TICKERS = [
#     # ============ TECHNOLOGY (70) ============
#     "AAPL", "MSFT", "NVDA", "GOOGL", "META", "AVGO", "ORCL", "CRM", "ADBE", "AMD",
#     "INTC", "QCOM", "TXN", "MU", "AMAT", "INTU", "NOW", "PANW", "SNOW", "CRWD",
#     "CSCO", "IBM", "ACN", "ANET", "ADI", "KLAC", "LRCX", "MRVL", "MCHP", "ON",
#     "NXPI", "MPWR", "SWKS", "QRVO", "TER", "KEYS", "FTNT", "ZS", "OKTA", "TEAM",
#     "WDAY", "ADSK", "SNPS", "CDNS", "ANSS", "PTC", "TYL", "EPAM", "CTSH", "IT",
#     "GLW", "APH", "TEL", "MSI", "JBL", "STX", "WDC", "NTAP", "PSTG", "HPQ",
#     "DELL", "SMCI", "GDDY", "AKAM", "FFIV", "GEN", "VRSN", "PAYC", "PAYX", "DAY",

#     # ============ COMMUNICATION (30) ============
#     "DIS", "NFLX", "CMCSA", "T", "VZ", "TMUS", "CHTR", "EA", "TTWO", "ATVI",
#     "WBD", "PARA", "FOXA", "FOX", "NWSA", "NWS", "OMC", "IPG", "MTCH", "ZG",
#     "GOOG", "LYV", "MTCH", "NWS", "SPOT", "ROKU", "PINS", "SNAP", "TTD", "APP",

#     # ============ CONSUMER DISCRETIONARY (55) ============
#     "AMZN", "TSLA", "HD", "MCD", "NKE", "SBUX", "TGT", "LOW", "BKNG", "MAR",
#     "F", "GM", "EBAY", "ETSY", "ABNB", "DASH", "UBER", "LYFT", "COST", "WMT",
#     "LULU", "ROST", "TJX", "BURL", "YUM", "CMG", "DPZ", "DRI", "LVS", "WYNN",
#     "MGM", "RCL", "CCL", "NCLH", "EXPE", "H", "HLT", "MAR", "RCL", "CZR",
#     "DG", "DLTR", "DLTR", "BBY", "KMX", "AN", "GRMN", "POOL", "ULTA", "DECK",
#     "TPR", "RL", "LEN", "DHI", "PHM", "NVR",

#     # ============ CONSUMER STAPLES (38) ============
#     "PG", "KO", "PEP", "PM", "MO", "CL", "EL", "KMB", "GIS", "K",
#     "HSY", "MDLZ", "STZ", "BF.B", "TAP", "YUM", "COST", "WMT", "TGT", "KR",
#     "SYY", "ADM", "TSN", "HRL", "CPB", "CAG", "SJM", "MKC", "CLX", "CHD",
#     "CL", "KMB", "KHC", "CAG", "WBA", "CVS", "KR", "BJ",

#     # ============ FINANCIALS (70) ============
#     "JPM", "V", "MA", "BAC", "WFC", "MS", "GS", "C", "BLK", "SCHW",
#     "AXP", "USB", "PNC", "TFC", "COF", "BK", "STT", "FITB", "HBAN", "RF",
#     "KEY", "CFG", "MTB", "ZION", "FRC", "SIVB", "ALLY", "DFS", "SYF", "MET",
#     "PRU", "AFL", "AIG", "ALL", "TRV", "PGR", "CB", "MMC", "AON", "AJG",
#     "BRK.B", "SPGI", "MCO", "ICE", "CME", "NDAQ", "CBOE", "MSCI", "FDS", "MKTX",
#     "V", "MA", "PYPL", "FIS", "FI", "GPN", "JKHY", "BR", "PAYX", "WU",
#     "CME", "CBOE", "RJF", "SCHW", "LPLA", "IBKR", "EVR", "HLI", "PJT", "MKTX",

#     # ============ HEALTHCARE (65) ============
#     "LLY", "UNH", "JNJ", "ABBV", "MRK", "PFE", "TMO", "ABT", "DHR", "BMY",
#     "AMGN", "GILD", "CVS", "MDT", "ISRG", "SYK", "ZTS", "REGN", "VRTX", "BIIB",
#     "ILMN", "MRNA", "BNTX", "NVAX", "HOLX", "IDXX", "IQV", "CRL", "A", "WAT",
#     "ZBH", "BSX", "EW", "BAX", "BDX", "CI", "HUM", "CNC", "MOH", "ELV",
#     "HCA", "MCK", "ABC", "CAH", "HOLX", "DVA", "UHS", "THC", "EHC", "AMED",
#     "VTRS", "OGN", "PRGO", "JAZZ", "ALNY", "BMRN", "SGEN", "EXAS", "NVCR", "RGEN",

#     # ============ ENERGY (25) ============
#     "XOM", "CVX", "COP", "SLB", "EOG", "PXD", "MPC", "PSX", "VLO", "OXY",
#     "HAL", "BKR", "DVN", "FANG", "MRO", "APA", "CTRA", "OKE", "WMB", "KMI",
#     "ET", "EPD", "MPLX", "PAA", "TRGP",

#     # ============ INDUSTRIALS (50) ============
#     "CAT", "GE", "HON", "UPS", "BA", "LMT", "RTX", "DE", "MMM", "FDX",
#     "GD", "NOC", "LHX", "EMR", "ETN", "PH", "ROK", "CMI", "PCAR", "CSX",
#     "UNP", "NSC", "WM", "RSG", "ITW", "DOV", "IR", "XYL", "GNRC", "OTIS",
#     "CARR", "TT", "JCI", "CMI", "PCAR", "FAST", "GWW", "PWR", "URI", "SWK",
#     "SNA", "MAS", "ALLE", "AOS", "RBC", "EXPD", "CHRW", "ODFL", "XPO", "WAB",

#     # ============ MATERIALS (20) ============
#     "LIN", "APD", "SHW", "ECL", "DD", "NEM", "FCX", "VMC", "MLM", "PPG",
#     "IFF", "CE", "ALB", "DOW", "LYB", "CTVA", "FMC", "MOS", "IP", "PKG",

#     # ============ REAL ESTATE (20) ============
#     "AMT", "PLD", "CCI", "EQIX", "SPG", "O", "WELL", "DLR", "PSA", "AVB",
#     "EQR", "VTR", "ARE", "BXP", "VNO", "SBAC", "IRM", "EXR", "CUBE", "MAA",

#     # ============ UTILITIES (20) ============
#     "NEE", "DUK", "SO", "D", "AEP", "EXC", "XEL", "SRE", "PEG", "ED",
#     "EIX", "PCG", "WEC", "ES", "AEE", "DTE", "PPL", "CMS", "CNP", "LNT",

#     # ============ ETFs (6) ============
#     "SPY", "QQQ", "DIA", "IWM", "VTI", "VOO"
# ]


# def seed_database():
#     db = SessionLocal()
    
#     # 1. Remove duplicates from your list automatically
#     unique_tickers = list(set(ALL_TICKERS))
    
#     added_count = 0
#     skipped_count = 0
    
#     print(f"🚀 Starting to seed {len(unique_tickers)} unique tickers...")

#     for ticker in unique_tickers:
#         # Check if it already exists
#         existing = db.query(Company).filter(Company.ticker == ticker).first()
#         if existing:
#             skipped_count += 1
#             continue
            
#         try:
#             # Fetch real data
#             stock = yf.Ticker(ticker)
#             info = stock.info
            
#             name = info.get('longName') or info.get('shortName') or ticker
#             sector = info.get('sector', 'Unknown')
#             industry = info.get('industry', 'Unknown')
            
#             new_company = Company(
#                 ticker=ticker,
#                 name=name,
#                 sector=sector,
#                 industry=industry
#             )
#             db.add(new_company)
#             added_count += 1
#             print(f"✅ Added: {ticker} - {name}")
            
#             # Commit immediately to avoid batch failures
#             db.commit()
            
#         except Exception as e:
#             print(f"❌ Failed to fetch {ticker}: {e}")
#             db.rollback() # Important: Rollback on failure so the next one can proceed
            
#     print(f"\n🎉 DONE! Added {added_count} new companies. Skipped {skipped_count} existing.")
#     db.close()