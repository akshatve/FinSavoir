"use client";

import Link from "next/link";
import { getTrendingStocks } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";
import { formatCurrency } from "../../lib/format";
import CompanyLogo from "./CompanyLogo";

// Premium Mini Candlestick Chart
const MiniCandles = ({ data, isPositive }) => {
  if (!data || data.length === 0) return null;

  const width = 120;
  const height = 40;
  const padding = 2;

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
        const bodyHeight = Math.max(bodyBottom - bodyTop, 1.5);

        const x = padding + i * candleWidth;

        return (
          <g key={i}>
            <line x1={x + candleWidth / 2} y1={yHigh} x2={x + candleWidth / 2} y2={yLow} stroke={color} strokeWidth="1" />
            <rect x={x + 1} y={bodyTop} width={candleWidth - 2} height={bodyHeight} fill={color} rx="0.5" />
          </g>
        );
      })}
    </svg>
  );
};

// Helper to generate realistic fake candles if data is missing
const generateFakeCandles = (count, isUp) => {
  let candles = [];
  let currentPrice = 100;
  for (let i = 0; i < count; i++) {
    const move = (Math.random() - (isUp ? 0.3 : 0.7)) * 5;
    const open = currentPrice;
    const close = open + move;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    candles.push({ open, close, high, low });
    currentPrice = close;
  }
  return candles;
};

export default function TrendingStocks() {
  // 10 minutes TTL for Trending Stocks
  const { data: trending, loading } = useCachedData(
    "trending_stocks_cache", 
    getTrendingStocks, 
    10 
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16">
        <div className="h-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg w-64 mb-8"></div>
        <div className="flex gap-4 overflow-hidden w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[280px] h-[150px] bg-gray-100 dark:bg-gray-900 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!trending) return null;

  const marqueeItems = [...trending, ...trending];

  return (
    <section className="relative w-full py-8 bg-white dark:bg-[#0a0a0a] overflow-hidden transition-colors duration-300">
      
      {/* Background Grid Pattern from Hero */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-blue-100/5 to-transparent dark:from-blue-600/10 dark:via-transparent dark:to-transparent blur-3xl opacity-70" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Centered Header */}
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white flex items-center justify-center gap-2 tracking-tight">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            Trending Now
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg font-medium">The most actively traded stocks today</p>
        </div>

        {/* Marquee Container */}
        <div className="w-full overflow-hidden relative mask-fade-edges py-4">
          <div className="flex animate-marquee gap-4 hover:[animation-play-state:paused]">
            {marqueeItems.map((stock, index) => {
              const isPositive = stock.change_pct >= 0;
              
              return (
                <Link 
                  key={`${stock.ticker}-${index}`} 
                  href={`/company/${stock.ticker}`}
                  className="group relative min-w-[280px] bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Row: Logo, Ticker, Name */}
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <CompanyLogo ticker={stock.ticker} size="w-9 h-9" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">{stock.ticker}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{stock.name}</p>
                    </div>
                  </div>

                  {/* Bottom Row: Price/Change & Candles */}
                  <div className="flex items-end justify-between relative z-10">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">{formatCurrency(stock.price)}</p>
                      <p className={`text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{stock.change_pct.toFixed(2)}%
                      </p>
                    </div>
                    
                    {/* Candles */}
                    <div className="transform group-hover:scale-105 transition-transform duration-300">
                      <MiniCandles 
                        data={
                          stock.candles && stock.candles.length > 5 
                            ? stock.candles.slice(-15) 
                            : generateFakeCandles(15, isPositive)
                        } 
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}