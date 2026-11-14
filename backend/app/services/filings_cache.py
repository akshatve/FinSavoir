import feedparser
import threading
import time
import requests
from datetime import datetime, timezone

_filings_cache = {
    "data": [],
    "press_releases": [],   # <-- add this
    "last_updated": None,
    "is_loading": False,
}

def _fetch_filings():
    global _filings_cache
    _filings_cache["is_loading"] = True
    print("[FILINGS CACHE] Starting fetch...")
    start_time = time.time()

    try:
        headers = {
            "User-Agent": "FinSavoir contact@finsavoir.com",
            "Accept-Encoding": "gzip, deflate",
            "Host": "www.sec.gov",
        }
        
        # ─── PART 1: Fetch general recent filings (for /filings page) ───
        general_url = "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=&company=&dateb=&owner=include&count=300&output=atom"
        print(f"[FILINGS CACHE] Fetching general filings (300)...")
        general_res = requests.get(general_url, headers=headers, timeout=20)
        general_res.encoding = "ISO-8859-1"
        general_feed = feedparser.parse(general_res.content)
        print(f"[FILINGS CACHE] General feed: {len(general_feed.entries)} entries")
        
        # ─── PART 2: Fetch dedicated 8-K feed (for /press-releases page) ───
        # The "type=8-K" parameter filters to only 8-K filings
        press_url = "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&company=&dateb=&owner=include&count=100&output=atom"
        print(f"[FILINGS CACHE] Fetching 8-K press releases (100)...")
        press_res = requests.get(press_url, headers=headers, timeout=20)
        press_res.encoding = "ISO-8859-1"
        press_feed = feedparser.parse(press_res.content)
        print(f"[FILINGS CACHE] Press feed: {len(press_feed.entries)} entries")
        
        now = datetime.now(timezone.utc)
        
        # ─── Parser helper ───
        def parse_entry(entry):
            raw_title = entry.title
            if " - " in raw_title:
                form_type, rest = raw_title.split(" - ", 1)
                if " (" in rest:
                    company_name = rest.split(" (")[0].strip()
                else:
                    company_name = rest.strip()
            else:
                form_type = "Unknown"
                company_name = raw_title
            
            # Skip "Reporting" persons — only keep Issuers
            if "(Reporting)" in raw_title:
                return None
            
            published = entry.updated if hasattr(entry, 'updated') else None
            time_ago = "Recently"
            pub_iso = None
            
            if published:
                try:
                    dt = datetime.fromisoformat(published.replace("Z", "+00:00"))
                    diff_seconds = (now - dt).total_seconds()
                    
                    if diff_seconds < 60:
                        time_ago = "Just now"
                    elif diff_seconds < 3600:
                        time_ago = f"{int(diff_seconds // 60)}m ago"
                    elif diff_seconds < 86400:
                        time_ago = f"{int(diff_seconds // 3600)}h ago"
                    else:
                        time_ago = f"{int(diff_seconds // 86400)}d ago"
                    
                    pub_iso = dt.isoformat()
                except Exception:
                    pass
            
            return {
                "form_type": form_type.strip(),
                "company": company_name,
                "time_ago": time_ago,
                "published": pub_iso,
                "link": entry.link,
            }
        
        # Parse both feeds
        all_filings = []
        press_releases = []
        
        for entry in general_feed.entries:
            parsed = parse_entry(entry)
            if parsed:
                all_filings.append(parsed)
        
        for entry in press_feed.entries:
            parsed = parse_entry(entry)
            if parsed:
                press_releases.append(parsed)
        
        # Dedupe press releases by link
        seen = set()
        unique_press = []
        for f in press_releases:
            if f["link"] not in seen:
                seen.add(f["link"])
                unique_press.append(f)
        
        _filings_cache["data"] = all_filings
        _filings_cache["press_releases"] = unique_press
        _filings_cache["last_updated"] = datetime.now()
        
        elapsed = time.time() - start_time
        print(f"[FILINGS CACHE] ✓ General: {len(all_filings)} filings | Press: {len(unique_press)} 8-Ks | {elapsed:.1f}s")
    
    except Exception as e:
        print(f"[FILINGS CACHE] ✗ ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        _filings_cache["is_loading"] = False





def _refresh_loop():
    while True:
        _fetch_filings()
        time.sleep(5 * 60)


def start_filings_cache():
    if not _filings_cache["is_loading"] and not _filings_cache["data"]:
        print("[FILINGS CACHE] Starting background thread...")
        thread = threading.Thread(target=_refresh_loop, daemon=True)
        thread.start()


def get_paginated_filings(page: int = 1, limit: int = 20, form_type: str = "All", query: str = ""):
    data = _filings_cache["data"]
    
    if not data:
        return {
            "filings": [],
            "total_pages": 0,
            "total_filings": 0,
            "current_page": page,
            "is_loading": _filings_cache["is_loading"],
        }
    
    filtered = data
    if form_type and form_type != "All":
        filtered = [f for f in filtered if f["form_type"].startswith(form_type)]
    
    if query:
        q = query.lower()
        filtered = [
            f for f in filtered
            if q in f["company"].lower() or q in f["form_type"].lower()
        ]
    
    start_index = (page - 1) * limit
    end_index = start_index + limit
    
    return {
        "filings": filtered[start_index:end_index],
        "total_pages": (len(filtered) + limit - 1) // limit if filtered else 0,
        "total_filings": len(filtered),
        "current_page": page,
        "is_loading": False,
        "last_updated": _filings_cache["last_updated"].isoformat() if _filings_cache["last_updated"] else None,
    }






def get_press_releases(page: int = 1, limit: int = 20, query: str = ""):
    """Returns paginated 8-K filings (press releases)."""
    data = _filings_cache.get("press_releases", [])
    
    if not data:
        return {
            "filings": [],
            "total_pages": 0,
            "total_filings": 0,
            "current_page": page,
            "is_loading": _filings_cache["is_loading"],
        }
    
    filtered = data
    if query:
        q = query.lower()
        filtered = [
            f for f in filtered
            if q in f["company"].lower() or q in f["form_type"].lower()
        ]
    
    start_index = (page - 1) * limit
    end_index = start_index + limit
    
    return {
        "filings": filtered[start_index:end_index],
        "total_pages": (len(filtered) + limit - 1) // limit if filtered else 0,
        "total_filings": len(filtered),
        "current_page": page,
        "is_loading": False,
        "last_updated": _filings_cache["last_updated"].isoformat() if _filings_cache["last_updated"] else None,
    }