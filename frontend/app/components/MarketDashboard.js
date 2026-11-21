"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTopMovers } from "../../lib/api";
import { formatCurrency } from "../../lib/format";
import CompanyLogo from "./CompanyLogo";

// Safe number parser (handles both FMP and yfinance formats)
const safeNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Bar sized by the stock's real daily move, relative to the largest move in
// the list. (FMP's movers feed has no intraday history, so no chart is drawn.)
const ChangeBar = ({ change, maxAbs, positive }) => {
  const width = maxAbs > 0 ? Math.max((Math.abs(change) / maxAbs) * 100, 4) : 0;
  return (
    <div className="w-[110px] h-2 rounded-full bg-gray-800 overflow-hidden" aria-hidden="true">
      <div
        className={`h-full rounded-full ${positive ? "bg-emerald-500" : "bg-red-500"}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

export default function MarketDashboard() {
  const [movers, setMovers] = useState({ gainers: [], losers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTopMovers();
        setMovers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        <div className="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
      </div>
    );
  }

  if (!movers) return null;

  // Filter out invalid stocks (missing symbol or price)
const isValidStock = (s) => s && s.symbol && s.price !== undefined && s.price !== null;

const gainersData = (movers.gainers || []).filter(isValidStock);
const losersData = (movers.losers || []).filter(isValidStock);


  // Never repeat a stock to fill space: show only what the feed returned.
  const topGainersList = gainersData.slice(0, 6);
  const topGainersChart = gainersData.slice(0, 3);
  const topLosersList = losersData.slice(0, 6);
  const topLosersChart = losersData.slice(0, 3);
  const maxAbs = (rows) => Math.max(0, ...rows.map((r) => Math.abs(safeNumber(r.changesPercentage))));
  const gainersMax = maxAbs(topGainersChart);
  const losersMax = maxAbs(topLosersChart);

  return (
    <div className="space-y-10">
      {/* ================= TOP GAINERS SECTION ================= */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Gainers</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Highest price increases today</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* LEFT: 70% width */}
          <div className="w-full lg:w-[70%] grid grid-cols-1 sm:grid-cols-2 gap-0 border-r border-gray-100 dark:border-gray-800">
            {topGainersList.map((stock, index) => {
              const change = safeNumber(stock.changesPercentage);
              return (
                <Link
                  key={`${stock.symbol}-${index}`}
                  href={`/company/${stock.symbol}`}
                  className={`flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group border-b border-gray-100 dark:border-gray-800 ${index % 2 === 0 ? 'sm:border-r' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    
                    <CompanyLogo ticker={stock.symbol} size="w-9 h-9" />

                
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {stock.symbol}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[120px]">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatCurrency(stock.price)}</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +{change.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* RIGHT: 30% width */}
          <div className="w-full lg:w-[30%] bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/40 dark:to-[#0a0a0a] p-5 flex flex-col justify-center gap-4">
            {topGainersChart.map((stock, index) => {
              const change = safeNumber(stock.changesPercentage);
              return (
                <Link
                  key={`chart-${stock.symbol}-${index}`}
                  href={`/company/${stock.symbol}`}
                  className="group flex items-center justify-between p-3 bg-black dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <CompanyLogo ticker={stock.symbol} size="w-6 h-6" />
                      <p className="font-bold text-sm text-gray-200 dark:text-white">{stock.symbol}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-400">{formatCurrency(stock.price)}</p>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+{change.toFixed(2)}%</p>
                    </div>
                  </div>
                  <div className="transform group-hover:scale-105 transition-transform duration-300">
                    <ChangeBar change={change} maxAbs={gainersMax} positive={change >= 0} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= TOP LOSERS SECTION ================= */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-xl">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Losers</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Largest price drop today</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* LEFT: 70% width */}
          <div className="w-full lg:w-[70%] grid grid-cols-1 sm:grid-cols-2 gap-0 border-r border-gray-100 dark:border-gray-800">
            {topLosersList.map((stock, index) => {
              const change = safeNumber(stock.changesPercentage);
              return (
                <Link
                  key={`${stock.symbol}-${index}`}
                  href={`/company/${stock.symbol}`}
                  className={`flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group border-b border-gray-100 dark:border-gray-800 ${index % 2 === 0 ? 'sm:border-r' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <CompanyLogo ticker={stock.symbol} size="w-9 h-9" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {stock.symbol}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[120px]">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatCurrency(stock.price)}</p>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">
                      {change.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* RIGHT: 30% width */}
          <div className="w-full lg:w-[30%] bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/40 dark:to-[#0a0a0a] p-5 flex flex-col justify-center gap-4">
            {topLosersChart.map((stock, index) => {
              const change = safeNumber(stock.changesPercentage);
              return (
                <Link
                  key={`chart-${stock.symbol}-${index}`}
                  href={`/company/${stock.symbol}`}
                  className="group flex items-center justify-between p-3 bg-black dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <CompanyLogo ticker={stock.symbol} size="w-6 h-6" />
                      <p className="font-bold text-sm text-gray-200 dark:text-white">{stock.symbol}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-400">{formatCurrency(stock.price)}</p>
                      <p className="text-xs font-bold text-red-600 dark:text-red-400">{change.toFixed(2)}%</p>
                    </div>
                  </div>
                  <div className="transform group-hover:scale-105 transition-transform duration-300">
                    <ChangeBar change={change} maxAbs={losersMax} positive={change >= 0} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}