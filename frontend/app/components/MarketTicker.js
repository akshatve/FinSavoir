"use client";

import { getMarketIndices } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";

// Custom Mini Candlestick Chart Component
const MiniCandles = ({ data, isPositive }) => {
  if (!data || data.length === 0) return null;

  const width = 75;
  const height = 40;
  const padding = 4;

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
        const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

        const x = padding + i * candleWidth;

        return (
          <g key={i}>
            <line x1={x + candleWidth / 2} y1={yHigh} x2={x + candleWidth / 2} y2={yLow} stroke={color} strokeWidth="1" />
            <rect x={x + 2} y={bodyTop} width={candleWidth - 4} height={bodyHeight} fill={color} rx="1" />
          </g>
        );
      })}
    </svg>
  );
};

export default function MarketTicker() {
  // 1 minute TTL for live indices
  const { data: indices, loading } = useCachedData(
    "market_indices_cache", 
    getMarketIndices, 
    1 
  );

  if (loading) {
    return <div className="h-[76px] w-full bg-[#0a0a0a] animate-pulse border-b border-gray-800"></div>;
  }

  if (!indices) return null;

  return (
    <div className="position-fixed w-full bg-[#0a0a0a] border-b border-gray-800 overflow-hidden">
      <div className="max-w-[1400px] mx-auto flex items-center h-[76px] px-4 sm:px-6 overflow-x-auto scrollbar-hide">
        
        {/* Left Label: US Markets */}
        <div className="flex items-center gap-2 pr-6 border-r border-gray-800 shrink-0">
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
             <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
          <span className="text-sm font-semibold text-gray-300">US Markets</span>
        </div>

        {/* Indices Data */}
        <div className="flex items-center justify-between w-full px-2 flex-1 gap-1">
          {indices.map((idx, i) => {
            const isPositive = idx.change_pct >= 0;
            const changeColor = isPositive ? "text-emerald-500" : "text-red-500";
            
            return (
              <div key={i} className="flex items-center gap-3 min-w-max">
                
                {/* Text Data */}
                <div className="flex flex-col justify-center">
                  <p className="text-[12px] font-bold text-gray-300 mb-0.5 whitespace-nowrap">
                    {idx.name}
                  </p>
                  <p className="text-[14px] font-bold text-white mb-0.5 tracking-tight">
                    {idx.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className={`flex items-center gap-1.5 text-[12px] font-bold ${changeColor}`}>
                    <span>
                      {isPositive ? '+' : ''}{idx.change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span>
                      {isPositive ? '+' : ''}{idx.change_pct.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Mini Candlestick Chart */}
                <div className="h-10 flex items-center opacity-80 hover:opacity-100 transition-opacity">
                  <MiniCandles data={idx.candles} isPositive={isPositive} />
                </div>
                
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}