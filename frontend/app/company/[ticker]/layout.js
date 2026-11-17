"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCompanyOverview } from "../../../lib/api";
import { formatCurrency } from "../../../lib/format";
import CompanyLogo from "../../components/CompanyLogo";
import { useWatchlist } from "../../../lib/WatchlistContext";
import { useRecentlyViewed } from "../../../lib/RecentlyViewedContext";

export default function CompanyLayout({ children, params }) {
  const pathname = usePathname();
  const unwrappedParams = React.use(params);
  const ticker = unwrappedParams.ticker.toUpperCase();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { addToRecentlyViewed } = useRecentlyViewed();

  const [priceData, setPriceData] = useState(null);

  const menuItems = [
    { name: "Overview", path: `/company/${ticker}` },
    { name: "Pro Score", path: `/company/${ticker}/pro-score` },
    { name: "Summary", path: `/company/${ticker}/summary` },
    { name: "Financials", path: `/company/${ticker}/financials` },
    { name: "Chart", path: `/company/${ticker}/chart` },
    { name: "Statistics", path: `/company/${ticker}/statistics` },
    { name: "News", path: `/company/${ticker}/news` },
    { name: "Filings", path: `/company/${ticker}/filings` },
    { name: "Compare", path: `/company/${ticker}/compare` },
  ];

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await getCompanyOverview(ticker);
        setPriceData({
          price: res.current_price,
          prevClose: res.previous_close,
          name: res.name,
        });
      } catch (err) {
        console.error("Failed to load price");
      }
    };
    fetchPrice();
  }, [ticker]);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await getCompanyOverview(ticker);
        const data = {
          price: res.current_price,
          prevClose: res.previous_close,
          name: res.name,
        };
        setPriceData(data);

        // Track in recently viewed
        addToRecentlyViewed({
          ticker: ticker,
          name: res.name || ticker,
          price: res.current_price || 0,
          change_pct:
            res.current_price && res.previous_close
              ? ((res.current_price - res.previous_close) /
                  res.previous_close) *
                100
              : 0,
        });
      } catch (err) {
        console.error("Failed to load price");
      }
    };
    fetchPrice();
  }, [ticker]);

  const isPositive = priceData?.price >= priceData?.prevClose;
  const changeAmount = priceData ? priceData.price - priceData.prevClose : 0;
  const changePercent = priceData
    ? (changeAmount / priceData.prevClose) * 100
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a]">
      {/* Sticky Header Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6">
        <header className="relative bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden">
          {/* Header Content */}
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Left: Logo & Name */}
            <div className="flex items-center gap-5">
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner">
                <CompanyLogo
                  ticker={ticker}
                  name={priceData?.name}
                  size="w-16 h-16"
                />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {ticker}
                  </h1>
                  <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700">
                    NASDAQ
                  </span>
                </div>
                <p className="text-base text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  {priceData?.name || "Loading..."}
                </p>
              </div>
            </div>

            {/* Right: Price, Change & Watchlist */}
            <div className="text-left sm:text-right w-full sm:w-auto flex flex-col sm:items-end gap-3">
              {/* Price + Change Row */}
              <div className="flex items-center sm:justify-end gap-3 flex-wrap">
                <p className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {priceData ? formatCurrency(priceData.price) : "..."}
                </p>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-bold ${
                    isPositive
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  {isPositive ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6"
                      />
                    </svg>
                  )}
                  {priceData ? Math.abs(changeAmount).toFixed(2) : "..."}(
                  {priceData ? Math.abs(changePercent).toFixed(2) : "..."}%)
                </span>
              </div>

              {/* Watchlist Button */}
              <button
                onClick={() =>
                  toggleWatchlist({
                    ticker: ticker,
                    name: priceData?.name || ticker,
                    price: priceData?.price || 0,
                    change_pct:
                      priceData?.price && priceData?.prevClose
                        ? ((priceData.price - priceData.prevClose) /
                            priceData.prevClose) *
                          100
                        : 0,
                  })
                }
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  isInWatchlist(ticker)
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-[#094cb9] text-[#094cb9] dark:text-[#094cb9]"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill={isInWatchlist(ticker) ? "currentColor" : "none"}
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
                {isInWatchlist(ticker) ? "In Watchlist" : "Add to Watchlist"}
              </button>
            </div>
          </div>

          {/* Horizontal Tabs (UPDATED FOR MOBILE SCROLLING) */}
          <nav className="flex px-4 sm:px-6 gap-6 sm:gap-8 border-t border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/20 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`relative py-4 text-sm font-semibold transition-colors flex-shrink-0 ${
                    isActive
                      ? "text-[#094cb9] dark:text-[#0b55cc]"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-[#094cb9] dark:bg-[#0a58d4] rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.5)]"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </header>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {children}
      </main>
    </div>
  );
}