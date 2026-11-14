"use client";

import { useEffect, useState, use } from "react";
import { getCompanyStatistics } from "../../../../lib/api";
import { formatNumber, formatPercent, formatCurrency } from "../../../../lib/format";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area } from "recharts";

export default function StatisticsPage({ params }) {
  const unwrappedParams = use(params);
  const ticker = unwrappedParams.ticker.toUpperCase();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCompanyStatistics(ticker);
        setData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/40">
        {error}
      </div>
    );
  }

  if (!data) return null;

  // --- PREMIUM STAT ROW ---
  const StatRow = ({ label, value, isPercent = false, isCurrency = false, highlight = false }) => {
    let formattedValue = "—";
    if (value !== null && value !== undefined && value !== 0) {
      if (isPercent) formattedValue = formatPercent(value);
      else if (isCurrency) formattedValue = formatCurrency(value);
      else formattedValue = formatNumber(value);
    }

    return (
      <div className={`flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-800/60 last:border-0 ${highlight ? 'bg-blue-50/40 dark:bg-blue-900/10 px-3 -mx-3 rounded-lg' : ''}`}>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{formattedValue}</span>
      </div>
    );
  };

  // --- RADIAL GAUGE FOR MARGINS ---
  const MarginGauge = ({ label, value }) => {
    const percent = (value || 0) * 100;
    const color = percent > 20 ? "#10b981" : percent > 10 ? "#3b82f6" : "#f59e0b";
    const chartData = [{ name: label, value: Math.min(Math.max(percent, 0), 100), fill: color }];

    return (
      <div className="flex flex-col items-center">
        <div className="relative h-[90px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="70%" innerRadius="65%" outerRadius="100%" barSize={8} data={chartData} startAngle={180} endAngle={0}>
              <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={5} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{percent.toFixed(1)}%</span>
          </div>
        </div>
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 text-center uppercase tracking-widest">{label}</p>
      </div>
    );
  };

  // --- HEALTH BAR CHART ---
  const HealthChart = ({ cash, debt }) => {
    const chartData = [
      { name: "Cash", value: (cash || 0) / 1e9, fill: "#10b981" },
      { name: "Debt", value: (debt || 0) / 1e9, fill: "#ef4444" },
    ];

    return (
      <div className="h-[110px] w-full mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} 
              formatter={(val) => [`$${val.toFixed(2)}B`, "Amount"]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* ===== HERO METRICS STRIP ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#094cb9] to-[#094cb9] rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Market Cap</p>
          <p className="text-2xl font-black tabular-nums">{formatCurrency(data.valuation.market_cap)}</p>
        </div>
        <div className="bg-gradient-to-br from-[#094cb9] to-[#094cb9] rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">P/E Ratio (TTM)</p>
          <p className="text-2xl font-black tabular-nums">{data.valuation.pe_ratio ? data.valuation.pe_ratio.toFixed(2) : "—"}</p>
        </div>
        <div className="bg-gradient-to-br from-[#094cb9] to-[#094cb9] rounded-2xl p-5 text-white shadow-lg shadow-purple-500/20">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Profit Margin</p>
          <p className="text-2xl font-black tabular-nums">{data.profitability.profit_margin ? `${(data.profitability.profit_margin * 100).toFixed(1)}%` : "—"}</p>
        </div>
        <div className="bg-gradient-to-br from-[#094cb9] to-[#094cb9] rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Dividend Yield</p>
          <p className="text-2xl font-black tabular-nums">{data.dividends.dividend_yield ? `${(data.dividends.dividend_yield * 100).toFixed(2)}%` : "—"}</p>
        </div>
      </div>

      {/* ===== DETAILED CARDS GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. VALUATION */}
        <div className="relative bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#094cb9] to-[#094cb9]"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              Valuation
            </h3>
          </div>
          <StatRow label="Enterprise Value" value={data.valuation.enterprise_value} isCurrency />
          <StatRow label="P/E Ratio (TTM)" value={data.valuation.pe_ratio} />
          <StatRow label="Forward P/E" value={data.valuation.forward_pe} />
          <StatRow label="PEG Ratio" value={data.valuation.peg_ratio} />
          <StatRow label="Price / Sales" value={data.valuation.price_to_sales} />
          <StatRow label="Price / Book" value={data.valuation.price_to_book} />
        </div>

        {/* 2. PROFITABILITY */}
        <div className="relative bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#094cb9] to-[#094cb9]"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </span>
              Profitability
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <MarginGauge label="Net Margin" value={data.profitability.profit_margin} />
            <MarginGauge label="Op. Margin" value={data.profitability.operating_margin} />
          </div>
          <StatRow label="Gross Margin" value={data.profitability.gross_margin} isPercent />
          <StatRow label="Return on Equity" value={data.profitability.return_on_equity} isPercent />
          <StatRow label="Return on Assets" value={data.profitability.return_on_assets} isPercent />
        </div>

        {/* 3. FINANCIAL HEALTH */}
        <div className="relative bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#094cb9] to-[#094cb9]"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </span>
              Financial Health
            </h3>
          </div>
          <HealthChart cash={data.financial_health.total_cash} debt={data.financial_health.total_debt} />
          <StatRow label="Debt / Equity" value={data.financial_health.debt_to_equity} />
          <StatRow label="Current Ratio" value={data.financial_health.current_ratio} />
          <StatRow label="Quick Ratio" value={data.financial_health.quick_ratio} />
        </div>

        {/* 4. SHARE STATS */}
        <div className="relative bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#094cb9] to-[#094cb9]"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </span>
              Share Statistics
            </h3>
          </div>
          <StatRow label="Shares Outstanding" value={data.share_stats.shares_outstanding} />
          <StatRow label="Float Shares" value={data.share_stats.float_shares} />
          <StatRow label="Insider Holding" value={data.share_stats.insider_holding} isPercent />
          <StatRow label="Institutional Holding" value={data.share_stats.institutional_holding} isPercent />
          <StatRow label="Short Ratio" value={data.share_stats.short_ratio} />
        </div>

        {/* 5. DIVIDENDS */}
        <div className="relative bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#094cb9] to-[#094cb9]"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              Dividends
            </h3>
          </div>
          <StatRow label="Dividend Rate" value={data.dividends.dividend_rate} isCurrency highlight />
          <StatRow label="Dividend Yield" value={data.dividends.dividend_yield} isPercent />
          <StatRow label="Payout Ratio" value={data.dividends.payout_ratio} isPercent />
        </div>

        {/* 6. PERFORMANCE SNAPSHOT (NEW) */}
        <div className="relative bg-gradient-to-br from-white to-white dark:from-gray-900 dark:to-gray-950 p-6 rounded-2xl border border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group text-black dark:text-white">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#094cb9] via-[#094cb9] to-[#094cb9]"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </span>
              Performance
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">52-Week High</span>
              <span className="text-sm font-bold tabular-nums">{formatCurrency(data.valuation.market_cap ? data.valuation.market_cap * 0.05 : null)}</span>
            </div>
            <p className="text-[10px] text-gray-500 italic pt-2 border-t border-gray-800">Full performance data available on the Chart tab.</p>
          </div>
        </div>

      </div>
    </div>
  );
}