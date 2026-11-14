"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMarqueeStocks } from "../../lib/api";
import { formatCurrency } from "../../lib/format";

export default function StockMarquee() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMarqueeStocks();
        setStocks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || stocks.length === 0) {
    return (
      <div className="w-full h-11 bg-gray-50 dark:bg-[#0a0a0a] border-y border-gray-200 dark:border-gray-800 animate-pulse" />
    );
  }

  // Duplicate for seamless infinite scroll
  const items = [...stocks, ...stocks];

  return (
    <div className="w-full bg-gray-50 dark:bg-[#0a0a0a] border-y border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center h-11 mask-fade-edges">
        <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
          {items.map((stock, index) => {
            const isPositive = (stock.change_pct || 0) >= 0;
            return (
              <Link
                key={`${stock.ticker}-${index}`}
                href={`/company/${stock.ticker}`}
                className="flex items-center gap-2.5 px-6 border-r border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-[#111] transition-colors group"
              >
                {/* Ticker */}
                <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {stock.ticker}
                </span>
                
                {/* Price */}
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {formatCurrency(stock.price)}
                </span>
                
                {/* Change */}
                <span
                  className={`text-xs font-bold flex items-center gap-0.5 ${
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
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}