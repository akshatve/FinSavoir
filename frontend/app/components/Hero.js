"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { searchCompanies, getMarqueeStocks } from "../../lib/api";

export default function Hero() {
  const [ticker, setTicker] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // New States for Focus Dropdown
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("trending"); // 'trending' | 'recent'
  const [recentSearches, setRecentSearches] = useState([]);

  const router = useRouter();
  const searchRef = useRef(null);

  // Typing Animation State
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const fullText = "Master the Investment.";

  // Desktop detection — animation only runs on desktop/laptop
  const [isDesktop, setIsDesktop] = useState(false);

  // Popular tickers. Daily change comes from the live price cache; until it
  // loads (or if it is unavailable) the change is shown as "—", never guessed.
  const [quotes, setQuotes] = useState({});
  const trendingTickers = [
    { ticker: "AAPL", name: "Apple Inc." },
    { ticker: "NVDA", name: "NVIDIA Corp." },
    { ticker: "TSLA", name: "Tesla Inc." },
    { ticker: "MSFT", name: "Microsoft Corp." },
  ].map((t) => ({ ...t, change: quotes[t.ticker]?.change_pct ?? null }));

  useEffect(() => {
    getMarqueeStocks()
      .then((rows) => {
        const byTicker = {};
        (rows || []).forEach((r) => (byTicker[r.ticker] = r));
        setQuotes(byTicker);
      })
      .catch(() => {});
  }, []);

  // Detect desktop vs mobile (and react to resize)
  useEffect(() => {
    const checkIsDesktop = () => {
      // >= 1024px is desktop/laptop (Tailwind lg breakpoint)
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  // Ensure static text is shown on mobile (no animation)
  useEffect(() => {
    if (!isDesktop) {
      setTypedText(fullText);
      setIsDeleting(false);
    } else {
      // Reset so the typing animation can start fresh when switching to desktop
      setTypedText("");
      setIsDeleting(false);
    }
  }, [isDesktop]);

  // Load recent searches from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("recent_searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save search to recent history
  const addToRecent = (tickerSymbol) => {
    const updated = [
      tickerSymbol,
      ...recentSearches.filter((t) => t !== tickerSymbol),
    ].slice(0, 4);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  // Handle Search Debounce
  useEffect(() => {
    if (ticker.length < 1) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchCompanies(ticker);
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [ticker]);

  // Handle Infinite Typing/Deleting Animation — ONLY on desktop
  useEffect(() => {
    if (!isDesktop) return; // <-- skip entirely on mobile/tablet

    let timeout;
    const type = () => {
      if (!isDeleting) {
        if (typedText.length < fullText.length) {
          setTypedText(fullText.substring(0, typedText.length + 1));
          timeout = setTimeout(type, 100);
        } else {
          timeout = setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(fullText.substring(0, typedText.length - 1));
          timeout = setTimeout(type, 50);
        } else {
          timeout = setTimeout(() => setIsDeleting(false), 500);
        }
      }
    };
    timeout = setTimeout(type, 100);
    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, isDesktop]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (ticker.trim()) {
      addToRecent(ticker.toUpperCase());
      router.push(`/company/${ticker.toUpperCase()}`);
      setIsFocused(false);
      setShowDropdown(false);
    }
  };

  const handleSelectCompany = (selectedTicker) => {
    addToRecent(selectedTicker);
    router.push(`/company/${selectedTicker}`);
    setTicker("");
    setIsFocused(false);
    setShowDropdown(false);
  };

  return (
    // 1. REMOVED overflow-hidden FROM SECTION
    <section className="relative flex flex-col items-center justify-center pt-10 pb-10 px-6 bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300 font-sans">
      {/* ================= BACKGROUND EFFECTS ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[900px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/20 via-blue-100/5 to-transparent dark:from-blue-600/15 dark:via-transparent dark:to-transparent blur-3xl opacity-70" />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 max-w-4xl mx-auto text-center flex flex-col items-center"
      >
        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            Free · Built on SEC EDGAR filings
          </span>
        </motion.div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-[75px] font-black tracking-tighter mb-6 text-slate-900 dark:text-white leading-[1.05]">
          Know the Business. <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-[#0442a5]">
            {isDesktop ? (
              <>
                {typedText}
                <span className="inline-block w-[4px] h-[0.9em] ml-1 bg-[#094cb9] dark:bg-[#094cb9] align-middle animate-pulse"></span>
              </>
            ) : (
              // Static text on mobile — no cursor, no animation
              <>{fullText}</>
            )}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          Spend less time searching through filings and more time understanding
          companies. Explore profits, cash flow, and debt, compare peers, and
          follow reported figures back to their sources.
        </p>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl mx-auto"
        >
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-widest">
            Research a company
          </p>

          {/* 2. ADDED overflow-visible TO SEARCH WRAPPER */}
          <div ref={searchRef} className="relative group mb-6 overflow-visible">
            {/* Glow effect on focus */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-md opacity-0 group-focus-within:opacity-20 transition duration-500"></div>

            <form
              onSubmit={handleSearch}
              className="relative flex items-center bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5"
            >
              {/* Search Icon / Spinner */}
              <div className="pl-6 pr-4 flex items-center pointer-events-none">
                {isSearching ? (
                  <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                ) : (
                  <svg
                    className="w-6 h-6 text-slate-400 dark:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </div>

              {/* Input */}
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder="Search company name or ticker (e.g., AAPL)"
                className="w-full py-5 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-lg font-medium"
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="relative mr-3 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-[#00296b] hover:bg-[#011d49] transition-colors duration-200 active:scale-95 shadow-md shadow-blue-500/20 overflow-hidden group"
              >
                {/* Tilted continuous shine sweep */}
                <span className="absolute inset-0 block overflow-hidden rounded-xl pointer-events-none">
                  <span
                    className="absolute top-0 h-[200%] -translate-y-1/2 w-[30%] bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shine"
                    style={{
                      transform: "skewX(-20deg)",
                      willChange: "left, transform",
                    }}
                  />
                </span>

                {/* Text */}
                <span className="relative">Search</span>
              </button>
            </form>

            {/* ================= FOCUS / LIVE SEARCH DROPDOWN ================= */}
            <AnimatePresence>
              {(isFocused || showDropdown) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  // 3. ADDED z-[999] TO ENSURE IT SITS ON TOP
                  className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-[999] text-left"
                >
                  {/* IF USER IS TYPING: Show Live Results */}
                  {ticker.length > 0 ? (
                    results.length > 0 ? (
                      results.map((company) => (
                        <button
                          key={company.ticker}
                          onClick={() => handleSelectCompany(company.ticker)}
                          className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                              {company.ticker}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[250px]">
                              {company.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                            {company.sector}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-5 py-8 text-center text-sm text-gray-500">
                        No companies found.
                      </div>
                    )
                  ) : (
                    /* IF USER IS NOT TYPING: Show Tabs */
                    <div>
                      {/* Tabs */}
                      <div className="flex border-b border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => setActiveTab("trending")}
                          className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === "trending" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                        >
                          Trending
                        </button>
                        <button
                          onClick={() => setActiveTab("recent")}
                          className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === "recent" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                        >
                          Recent Searches
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="p-2">
                        {activeTab === "trending" && (
                          <div className="flex flex-col">
                            {trendingTickers.map((t) => (
                              <button
                                key={t.ticker}
                                onClick={() => handleSelectCompany(t.ticker)}
                                className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                                    {t.ticker.slice(0, 2)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                      {t.ticker}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {t.name}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`text-xs font-bold ${
                                    t.change === null
                                      ? "text-gray-400"
                                      : t.change >= 0
                                        ? "text-emerald-500"
                                        : "text-red-500"
                                  }`}
                                >
                                  {t.change === null
                                    ? "—"
                                    : `${t.change >= 0 ? "+" : ""}${t.change.toFixed(2)}%`}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        {activeTab === "recent" && (
                          <div className="flex flex-col">
                            {recentSearches.length > 0 ? (
                              recentSearches.map((t) => (
                                <button
                                  key={t}
                                  onClick={() => handleSelectCompany(t)}
                                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                                >
                                  <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {t}
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="px-5 py-8 text-center text-sm text-gray-500">
                                Your recent searches will appear here.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Popular Tickers (Quick Links) */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="text-sm text-slate-500 dark:text-slate-400 mr-1">
              Popular:
            </span>
            {["AAPL", "MSFT", "NVDA", "TSLA", "AMZN"].map((t) => (
              <Link
                key={t}
                href={`/company/${t}`}
                className="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
              >
                {t}
              </Link>
            ))}
          </div>

          {/* Helper Link */}
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Free to read without an account.{" "}
            <Link
              href="/companies"
              className="text-[#00296b] dark:text-gray-300 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
            >
              Explore all companies
              <span className="inline-block ml-1 transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}