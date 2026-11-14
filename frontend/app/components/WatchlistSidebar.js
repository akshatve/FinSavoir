"use client";

import { useWatchlist } from "../../lib/WatchlistContext";
import { motion, AnimatePresence } from "framer-motion";
import CompanyLogo from "./CompanyLogo";
import { formatCurrency } from "../../lib/format";
import Link from "next/link";

export default function WatchlistSidebar() {
  const { watchlist, isOpen, closeWatchlist, removeFromWatchlist } =
    useWatchlist();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeWatchlist}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-white dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-gray-800 z-[999] flex flex-col shadow-2xl"
          >
            {/* Premium Header with Gradient */}
            <div className="relative px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-[#0a0a0a] dark:to-[#0f0f0f]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#00296b] flex items-center justify-center shadow-lg shadow-blue-500/20">
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
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                      My Watchlist
                    </h2>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                      {watchlist.length}{" "}
                      {watchlist.length === 1 ? "stock" : "stocks"} tracked
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeWatchlist}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-all"
                  aria-label="Close watchlist"
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
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {watchlist.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      <svg
                        className="w-9 h-9 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Nothing here yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
                    Add stocks you're following to track them in real-time.
                  </p>
                  <Link
                    href="/stocks"
                    onClick={closeWatchlist}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    Browse Stocks
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              ) : (
                // Watchlist Items
                <div className="p-4 space-y-2">
                  {watchlist.map((stock, index) => {
                    const isPositive = (stock.change_pct || 0) >= 0;
                    return (
                      <motion.div
                        key={stock.ticker}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        // 1. ADD overflow-hidden AND relative TO THE CARD
                        className="relative overflow-hidden flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800"
                      >
                        {/* 2. THE ACCENT BAR - FULL HEIGHT, NO TOP/BOTTOM INSETS */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${
                            isPositive ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        ></div>

                        {/* 3. ADD pl-2 TO THE LINK SO TEXT DOESN'T OVERLAP THE BAR */}
                        <Link
                          href={`/company/${stock.ticker}`}
                          onClick={closeWatchlist}
                          className="flex items-center gap-3 flex-1 min-w-0 pl-2"
                        >
                          <CompanyLogo ticker={stock.ticker} size="w-11 h-11" />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                              {stock.ticker}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {stock.name}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-gray-900 dark:text-white text-sm tabular-nums">
                              {formatCurrency(stock.price || 0)}
                            </p>
                            <p
                              className={`text-xs font-bold tabular-nums flex items-center justify-end gap-0.5 ${
                                isPositive
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {isPositive ? (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                                  />
                                ) : (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                  />
                                )}
                              </svg>
                              {Math.abs(stock.change_pct || 0).toFixed(2)}%
                            </p>
                          </div>
                        </Link>

                        <button
                          onClick={() => removeFromWatchlist(stock.ticker)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
                          aria-label={`Remove ${stock.ticker} from watchlist`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Premium Footer */}
            {watchlist.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={closeWatchlist}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add More
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Clear all stocks from your watchlist?")) {
                        watchlist.forEach((s) => removeFromWatchlist(s.ticker));
                      }
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
