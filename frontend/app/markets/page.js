"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTopMovers } from "../../lib/api";
import { formatCurrency } from "../../lib/format";
import CompanyLogo from "../components/CompanyLogo";

// Safe number parser (handles both FMP strings and yfinance numbers)
const safeNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Custom Mini Candlestick Component
const MiniCandles = ({ data }) => {
  if (!data || data.length === 0) return null;

  const width = 100;
  const height = 40;
  const padding = 1;

  const allLows = data.map(d => d.low);
  const allHighs = data.map(d => d.high);
  const min = Math.min(...allLows);
  const max = Math.max(...allHighs);
  const range = max - min || 1;

  const candleWidth = (width - padding * 2) / data.length;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {data.map((candle, i) => {
        const isCandleUp = candle.close >= candle.open;
        const color = isCandleUp ? "#10b981" : "#ef4444";
        const yHigh = height - ((candle.high - min) / range) * height;
        const yLow = height - ((candle.low - min) / range) * height;
        const yOpen = height - ((candle.open - min) / range) * height;
        const yClose = height - ((candle.close - min) / range) * height;
        const bodyTop = Math.min(yOpen, yClose);
        const bodyBottom = Math.max(yOpen, yClose);
        const bodyHeight = Math.max(bodyBottom - bodyTop, 2);
        const x = padding + i * candleWidth;

        return (
          <g key={i}>
            <line x1={x + candleWidth / 2} y1={yHigh} x2={x + candleWidth / 2} y2={yLow} stroke={color} strokeWidth="1.2" />
            <rect x={x + 1} y={bodyTop} width={Math.max(candleWidth - 2, 3)} height={bodyHeight} fill={color} rx="0.5" />
          </g>
        );
      })}
    </svg>
  );
};

// Generate realistic OHLC candles from FMP's change %
const generateCandlesFromChange = (changePercent, numCandles = 15) => {
  let change = 0;
  if (typeof changePercent === "number") change = changePercent;
  else if (typeof changePercent === "string") {
    change = parseFloat(changePercent.replace(/[^0-9.-]/g, "")) || 0;
  }

  const clampedChange = Math.max(Math.min(change, 20), -20);
  const avgBodySize = Math.abs(clampedChange) / numCandles * 1.5;
  const startPrice = 100;
  const endPrice = startPrice * (1 + clampedChange / 100);
  const noiseAmplitude = avgBodySize * 2;

  const candles = [];
  let currentPrice = startPrice;

  for (let i = 0; i < numCandles; i++) {
    const progress = i / (numCandles - 1);
    const trendPrice = startPrice + (endPrice - startPrice) * progress;
    const open = currentPrice;
    const randomMove = (Math.random() - 0.5) * noiseAmplitude;
    const trendMove = (trendPrice - open) * 0.3;
    const sizeMultiplier = Math.random() < 0.3 ? 0.3 : Math.random() < 0.8 ? 1 : 2;
    const close = open + (randomMove + trendMove) * sizeMultiplier;

    const bodyTop = Math.max(open, close);
    const bodyBottom = Math.min(open, close);
    const wickTop = bodyTop + Math.random() * avgBodySize * 0.8;
    const wickBottom = bodyBottom - Math.random() * avgBodySize * 0.8;

    candles.push({ open, close, high: wickTop, low: wickBottom });
    currentPrice = close;
  }

  return candles;
};

export default function MarketsPage() {
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

  const isValidStock = (s) => s && s.symbol && s.price !== undefined && s.price !== null;
  const gainersData = (movers.gainers || []).filter(isValidStock);
  const losersData = (movers.losers || []).filter(isValidStock);

  const topGainersCards = gainersData.slice(0, 3);
  const topLosersCards = losersData.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">

        {/* PAGE HEADER */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Live Data</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            Market Movers
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            The biggest gainers and losers in the US stock market today.
          </p>
        </div>

        {/* TOP CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* TOP GAINERS CARDS */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-emerald-50/50 dark:bg-emerald-900/10">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Gainers</h2>
                <p className="text-xs text-gray-500">Biggest upward moves</p>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {topGainersCards.map((stock, index) => {
                const change = safeNumber(stock.changesPercentage);
                return (
                  <Link
                    key={stock.symbol}
                    href={`/company/${stock.symbol}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#111] hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-gray-300 dark:text-gray-700 w-6">{index + 1}</span>
                      <CompanyLogo ticker={stock.symbol} size="w-10 h-10" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{stock.symbol}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[140px]">{stock.name}</p>
                      </div>
                    </div>

                    <div className="w-20 h-10 hidden sm:flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                      <MiniCandles data={generateCandlesFromChange(stock.changesPercentage)} />
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(stock.price)}</p>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">+{change.toFixed(2)}%</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* TOP LOSERS CARDS */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-red-50/50 dark:bg-red-900/10">
              <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-xl">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Losers</h2>
                <p className="text-xs text-gray-500">Biggest downward moves</p>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {topLosersCards.map((stock, index) => {
                const change = safeNumber(stock.changesPercentage);
                return (
                  <Link
                    key={stock.symbol}
                    href={`/company/${stock.symbol}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#111] hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-red-300 dark:hover:border-red-700 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-gray-300 dark:text-gray-700 w-6">{index + 1}</span>
                      <CompanyLogo ticker={stock.symbol} size="w-10 h-10" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">{stock.symbol}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[140px]">{stock.name}</p>
                      </div>
                    </div>

                    <div className="w-20 h-10 hidden sm:flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                      <MiniCandles data={generateCandlesFromChange(stock.changesPercentage)} />
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(stock.price)}</p>
                      <p className="text-sm font-black text-red-600 dark:text-red-400">{change.toFixed(2)}%</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

        {/* FULL TABLES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* GAINERS TABLE */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">All Gainers</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">TOP 10</span>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 font-semibold">Company</th>
                  <th className="px-6 py-3 text-right font-semibold">Price</th>
                  <th className="px-6 py-3 text-right font-semibold">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {gainersData.map((stock) => {
                  const change = safeNumber(stock.changesPercentage);
                  return (
                    <tr key={stock.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="px-6 py-3">
                        <Link href={`/company/${stock.symbol}`} className="flex items-center gap-3 group">
                          <CompanyLogo ticker={stock.symbol} size="w-7 h-7" />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{stock.symbol}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[120px]">{stock.name}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(stock.price)}</td>
                      <td className="px-6 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">+{change.toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* LOSERS TABLE */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">All Losers</h3>
              <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md">TOP 10</span>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 font-semibold">Company</th>
                  <th className="px-6 py-3 text-right font-semibold">Price</th>
                  <th className="px-6 py-3 text-right font-semibold">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {losersData.map((stock) => {
                  const change = safeNumber(stock.changesPercentage);
                  return (
                    <tr key={stock.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="px-6 py-3">
                        <Link href={`/company/${stock.symbol}`} className="flex items-center gap-3 group">
                          <CompanyLogo ticker={stock.symbol} size="w-7 h-7" />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{stock.symbol}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[120px]">{stock.name}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(stock.price)}</td>
                      <td className="px-6 py-3 text-right font-black text-red-600 dark:text-red-400">{change.toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}