"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect, useRef } from "react";
import { searchCompanies } from "../../lib/api";
import { useWatchlist } from "../../lib/WatchlistContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { watchlist, openWatchlist } = useWatchlist();

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // === NEW: Mobile menu state ===
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileSearchRef = useRef(null);

  // Auth State
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    checkAuth();
    window.addEventListener("authChanged", checkAuth);
    return () => window.removeEventListener("authChanged", checkAuth);
  }, []);

  // === NEW: close mobile menu on route change ===
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // === NEW: lock body scroll when mobile menu open ===
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // === NEW: Demo video state ===
  const [showDemo, setShowDemo] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowDemo(false);
        setMobileMenuOpen(false);
      }
    };
    if (showDemo || mobileMenuOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showDemo, mobileMenuOpen]);

  // Handle Search Debounce
  // useEffect(() => {
  //   if (query.length < 1) {
  //     setResults([]);
  //     setShowDropdown(false);
  //     return;
  //   }

  //   const delayDebounceFn = setTimeout(async () => {
  //     setIsSearching(true);
  //     try {
  //       const data = await searchCompanies(query);
  //       setResults(data);
  //       setShowDropdown(true);
  //     } catch (err) {
  //       console.error(err);
  //     } finally {
  //       setIsSearching(false);
  //     }
  //   }, 300);

  //   return () => clearTimeout(delayDebounceFn);
  // }, [query]);


  // Handle Search Debounce
  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // ADD THIS LOG
    console.log("⌨️ [Navbar] User typing:", query);

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        // ADD THIS LOG
        console.log("⏳ [Navbar] Debounce finished, calling API...");
        
        const data = await searchCompanies(query);
        
        // ADD THIS LOG
        console.log("✅ [Navbar] Data received:", data);
        
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("❌ [Navbar] Catch block:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);



  // Close dropdown when clicking outside (desktop + mobile search)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inDesktop =
        searchRef.current && searchRef.current.contains(event.target);
      const inMobile =
        mobileSearchRef.current && mobileSearchRef.current.contains(event.target);
      if (!inDesktop && !inMobile) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChanged"));
    setMobileMenuOpen(false);
    router.push("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Stocks", path: "/stocks" },
    { name: "Sectors", path: "/sectors" },
    { name: "Markets", path: "/markets" },
    { name: "News", path: "/news" },
    { name: "Press", path: "/press-releases" },
    { name: "Filings", path: "/filings" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // Reusable search results renderer
  const renderSearchResults = () => {
    if (!showDropdown || results.length === 0) return null;
    return (
      <div className="absolute z-60 top-12 left-0 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {results.map((company) => (
          <Link
            key={company.ticker}
            href={`/company/${company.ticker}`}
            onClick={() => {
              setShowDropdown(false);
              setQuery("");
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                {company.ticker}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                {company.name}
              </span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
              {company.sector}
            </span>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#0a0a0a]/80 border-b border-gray-200/80 dark:border-gray-800/80 transition-colors duration-300">
        {/* === ROW 1: Logo, Search, Auth === */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/logo/logo2.png"
                alt="FinSavoir Logo"
                className="w-28 sm:w-40 md:w-50 h-auto max-h-12 md:max-h-22 object-contain group-hover:scale-105 transition-transform"
              />
            </Link>
          </div>

          {/* Center: Search Bar (DESKTOP ONLY) */}
          <div
            className="flex-1 max-w-xl relative hidden md:block"
            ref={searchRef}
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ticker (e.g., AAPL)..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100/80 dark:bg-gray-900/80 border border-transparent focus:border-blue-500/50 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-gray-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
              />
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            {renderSearchResults()}
          </div>

          {/* Right: Theme, Auth (DESKTOP) + Mobile icons */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* === WATCH DEMO BUTTON (DESKTOP ONLY) === */}
            <button
              onClick={() => setShowDemo(true)}
              className="relative hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white overflow-hidden group bg-[#00296b] transition-all duration-500 hover:shadow-lg"
            >
              <span className="absolute inset-0 block overflow-hidden rounded-lg pointer-events-none">
                <span
                  className="absolute top-0 h-[200%] -translate-y-1/2 w-1/4 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shine"
                  style={{
                    transform: "skewX(-20deg)",
                    willChange: "left, transform",
                  }}
                />
              </span>
              <span className="relative flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="hidden lg:inline">Watch Demo</span>
              </span>
            </button>

            {/* Watchlist Icon — visible on BOTH mobile & desktop */}
            <button
              onClick={openWatchlist}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open watchlist"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              {watchlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#00296b] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {watchlist.length > 9 ? "9+" : watchlist.length}
                </span>
              )}
            </button>

            <ThemeToggle />

            {/* Auth — DESKTOP ONLY */}
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-800">
                <Link href="/profile" className="group relative">
                  <div className="w-9 h-9 bg-[#00296b] rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0a0a0a] rounded-full"></div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-800">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* === HAMBURGER (MOBILE ONLY) === */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* === ROW 2: Navigation Tabs (DESKTOP ONLY) === */}
        <div className="hidden md:block border-t border-gray-400/50 dark:border-gray-800/50">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 grid grid-cols-3 items-center h-12">
            <div className="hidden md:block"></div>
            <nav className="col-span-3 md:col-span-1 flex items-center justify-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`relative px-5 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                      isActive
                        ? "text-[#00296b] dark:text-white bg-blue-50 dark:bg-blue-900/20"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            <div className="hidden md:block"></div>
          </div>
        </div>
      </header>

      {/* === MOBILE MENU PANEL === */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Panel */}
          <div className="fixed top-16 left-0 right-0 bottom-0 z-40 md:hidden bg-white dark:bg-[#0a0a0a] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-4 space-y-5">
              {/* Mobile Search */}
              <div className="relative" ref={mobileSearchRef}>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search ticker (e.g., AAPL)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 dark:bg-gray-900/80 border border-transparent focus:border-blue-500/50 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-gray-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                {renderSearchResults()}
              </div>

              {/* Watch Demo Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowDemo(true);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-[#00296b] hover:bg-[#001f52] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Demo
              </button>

              {/* Nav Links */}
              <nav className="grid grid-cols-1 gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      href={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                        isActive
                          ? "text-[#00296b] dark:text-white bg-blue-50 dark:bg-blue-900/20"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-800" />

              {/* Auth Section */}
              {isLoggedIn ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-9 h-9 bg-[#00296b] rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        My Profile
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        View your account
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-lg text-sm font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* === Demo Video Modal === */}
      {showDemo && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowDemo(false)}
        >
          <div
            className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDemo(false)}
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
              aria-label="Close video"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <iframe
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1"
              title="FinSavoir Demo"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}