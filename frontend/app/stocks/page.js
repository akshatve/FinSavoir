"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllStocks, searchStocks } from "../../lib/api";
import { formatCurrency, formatNumber } from "../../lib/format";
import CompanyLogo from "../components/CompanyLogo";
import { useWatchlist } from "../../lib/WatchlistContext";

export default function StocksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [stocksData, setStocksData] = useState({
    stocks: [],
    total_pages: 1,
    total_stocks: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  // Debounce the search query (wait 300ms after typing stops)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data when page or debouncedQuery changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data;
        if (debouncedQuery.trim().length > 0) {
          // Global search (filters across ALL 112 stocks)
          data = await searchStocks(debouncedQuery, currentPage, 20);
        } else {
          // Normal paginated view
          data = await getAllStocks(currentPage, 20);
        }
        setStocksData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, debouncedQuery]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= stocksData.total_pages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            All US Stocks
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Browse all publicly traded companies on the US stock market.
          </p>
        </div>

        {/* Stats Bar */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              {debouncedQuery ? "Search Results" : "Total Companies"}
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {stocksData.total_stocks}
            </p>
          </div>
          <div className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Current Page
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {stocksData.total_pages > 0
                ? `${stocksData.current_page} of ${stocksData.total_pages}`
                : "0 of 0"}
            </p>
          </div>
          <div className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Data Source
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              SEC EDGAR
            </p>
          </div>
        </div> */}

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all stocks by ticker, company name, or sector..."
            className="w-full pl-12 pr-12 py-4 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 text-base shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
          )}
        </div>

        {/* Stock Table */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 font-bold tracking-wider">Sector</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">
                    Market Cap
                  </th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">
                    Price
                  </th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">
                    Change
                  </th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">
                    Saved
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-8 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>
                      </td>
                    </tr>
                  ))
                ) : stocksData.stocks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center text-gray-500"
                    >
                      No stocks found matching "{debouncedQuery}".
                    </td>
                  </tr>
                ) : (
                  stocksData.stocks.map((stock) => {
                    const isPositive = stock.change_pct >= 0;
                    return (
                      <tr
                        key={stock.ticker}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/company/${stock.ticker}`}
                            className="flex items-center gap-3"
                          >
                            <CompanyLogo ticker={stock.ticker} size="w-9 h-9" />
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                {stock.ticker}
                              </p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {stock.name}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">
                            {stock.sector}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                          {formatNumber(stock.market_cap)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                          {formatCurrency(stock.price)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`font-black ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {isPositive ? "+" : ""}
                            {stock.change_pct.toFixed(2)}%
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              toggleWatchlist({
                                ticker: stock.ticker,
                                name: stock.name,
                                price: stock.price,
                                change_pct: stock.change_pct,
                              })
                            }
                            className={`p-1.5 rounded-md transition-colors ${
                              isInWatchlist(stock.ticker)
                                ? "text-[#094cb9] dark:text-[#094cb9]"
                                : "text-gray-400 hover:text-[#094cb9]"
                            }`}
                            aria-label={
                              isInWatchlist(stock.ticker)
                                ? "Remove from watchlist"
                                : "Add to watchlist"
                            }
                          >
                            <svg
                              className="w-4 h-4"
                              fill={
                                isInWatchlist(stock.ticker)
                                  ? "currentColor"
                                  : "none"
                              }
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
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {stocksData.total_pages > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-500 font-medium">
                Page{" "}
                <span className="text-[#094cb9] font-bold">
                  {stocksData.current_page}
                </span>{" "}
                of <span className="font-bold">{stocksData.total_pages}</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 text-sm font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === stocksData.total_pages || loading}
                  className="px-4 py-2 text-sm font-bold bg-[#094cb9] text-white rounded-lg hover:bg-[#0842a0] disabled:opacity-40 transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
