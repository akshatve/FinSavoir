"use client";

import { useEffect, useState, use, useRef } from "react";
import { useTheme } from "next-themes";
import { getCompanyOverview } from "../../../lib/api";
import { formatNumber, formatCurrency, formatPercent } from "../../../lib/format";
import CompanyLogo from "../../components/CompanyLogo";

// ✅ ISOLATED COMPONENT WITH STRICT THEME SYNC
function TradingViewMiniChart({ ticker, theme }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [[ticker, `${ticker}|1D`]],
      chartOnly: false,
      width: "100%",
      height: "450",
      locale: "en",
      colorTheme: theme === "dark" ? "dark" : "light",
      isTransparent: true,
      autosize: true,
      showVolume: true,
      showMA: true,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontSize: "12",
      fontFamily: "inherit",
      noTimeScale: false,
      valuesTracking: "1",
      changeMode: "price-and-percent",
      chartType: "area",
      lineWidth: 2,
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    containerRef.current.appendChild(script);
  }, [ticker, theme]);

  return (
    <div
      className="tradingview-widget-container w-full h-[450px]"
      ref={containerRef}
    />
  );
}

// ✅ NEW: Animated Scroll Arrow
function ScrollArrow() {
  const handleClick = () => {
    window.scrollBy({ top: 500, behavior: "smooth" });
  };

  return (
    <div
      onClick={handleClick}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 cursor-pointer group"
      aria-label="Scroll down for more content"
    >
      <div className="relative flex flex-col items-center">
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />

        {/* Arrow button */}
        <div className="relative w-12 h-12 rounded-full bg-white dark:bg-gray-900 border-2 border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/30 flex items-center justify-center transition-transform group-hover:scale-110">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-bounce-slow"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>

        {/* Small label */}
        <span className="absolute top-full mt-3 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 whitespace-nowrap opacity-70">
          Scroll for more
        </span>
      </div>
    </div>
  );
}

export default function OverviewPage({ params }) {
  const unwrappedParams = use(params);
  const ticker = unwrappedParams.ticker.toUpperCase();
  const { resolvedTheme } = useTheme();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCompanyOverview(ticker);
        setData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticker]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  if (error)
    return <div className="bg-red-50 text-red-600 p-6 rounded-lg">{error}</div>;
  if (!data) return null;

  // --- FUTURISTIC KEY FIGURE COMPONENT ---
  const KeyFigure = ({ label, value, change, isPercent, isCurrency }) => {
    let formattedValue = "N/A";
    if (value !== null && value !== undefined) {
      if (isPercent) formattedValue = formatPercent(value);
      else if (isCurrency) formattedValue = formatCurrency(value);
      else formattedValue = formatNumber(value);
    }

    const isPositive = change >= 0;

    return (
      <div className="relative group bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${isPositive ? "bg-emerald-500" : "bg-red-500"} rounded-l-xl`}
        ></div>

        <div className="relative z-10">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1.5">
            {formattedValue}
          </p>

          {change !== null && change !== undefined ? (
            <p
              className={`text-xs font-bold flex items-center gap-1 ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
            >
              {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(1)}% vs prior
              yr
            </p>
          ) : (
            <p className="text-xs font-medium text-gray-400">—</p>
          )}
        </div>
      </div>
    );
  };

  // --- SLEEK STAT BAR ---
  const StatBar = ({ label, value, displayValue, max, color }) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="mb-4 group">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-600 dark:text-gray-400 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {label}
          </span>
          <span className="text-gray-900 dark:text-white font-bold">
            {displayValue}
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full ${color} transition-all duration-1000 ease-out group-hover:brightness-110`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ===== CHART CARD WITH SCROLL ARROW ===== */}
      <div className="relative">
        <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-visible">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20 rounded-t-2xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Price & Events
            </h2>
          </div>

          {/* Chart */}
          <TradingViewMiniChart
            key={resolvedTheme}
            ticker={ticker}
            theme={resolvedTheme}
          />

          {/* Gradient fade at the bottom of the chart */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-950 to-transparent pointer-events-none rounded-b-2xl" />
        </div>

        {/* ✅ SCROLL ARROW (floats below the chart, centered) */}
        <ScrollArrow />
      </div>

      {/* ===== PROFILE & KEY STATISTICS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 relative bg-white dark:bg-gray-950 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 tracking-tight flex items-center gap-2">
            Company Profile
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 relative z-10">
            {data.description}
          </p>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm relative z-10">
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1 font-semibold">
                Sector
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.sector}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1 font-semibold">
                Industry
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.industry}
              </span>
            </div>
            {data.website && (
              <div className="col-span-2">
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1 font-semibold">
                  Website
                </span>
                <a
                  href={data.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
                >
                  {data.website}
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Key Stats with Sleek Bars */}
        <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Key Statistics
          </h2>

          <StatBar
            label="Market Cap"
            value={data.market_cap / 1e9}
            displayValue={formatNumber(data.market_cap)}
            max={3500}
            color="bg-gradient-to-r from-blue-500 to-blue-400"
          />
          <StatBar
            label="P/E Ratio"
            value={data.pe_ratio || 0}
            displayValue={data.pe_ratio ? data.pe_ratio.toFixed(2) : "N/A"}
            max={100}
            color="bg-gradient-to-r from-indigo-500 to-indigo-400"
          />
          <StatBar
            label="Forward P/E"
            value={data.forward_pe || 0}
            displayValue={data.forward_pe ? data.forward_pe.toFixed(2) : "N/A"}
            max={100}
            color="bg-gradient-to-r from-purple-500 to-purple-400"
          />
          <StatBar
            label="Dividend Yield"
            value={(data.dividend_yield || 0) * 100}
            displayValue={
              data.dividend_yield ? formatPercent(data.dividend_yield) : "N/A"
            }
            max={10}
            color="bg-gradient-to-r from-emerald-500 to-emerald-400"
          />
          <StatBar
            label="Beta (Volatility)"
            value={data.beta || 0}
            displayValue={data.beta ? data.beta.toFixed(2) : "N/A"}
            max={3}
            color="bg-gradient-to-r from-orange-500 to-orange-400"
          />
        </div>
      </div>

      {/* ===== PREMIUM KEY FIGURES GRID ===== */}
      <div className="relative bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-baseline">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <svg
              className="w-5 h-5 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Key figures
          </h2>
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
            {data.fiscal_year}
          </span>
        </div>

        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <KeyFigure
            label="Revenue"
            value={data.revenue}
            change={data.revenue_yoy}
          />
          <KeyFigure
            label="Net income"
            value={data.net_income}
            change={data.net_income_yoy}
          />
          <KeyFigure
            label="Diluted EPS"
            value={data.eps}
            change={data.eps_yoy}
            isCurrency
          />
          <KeyFigure
            label="Operating margin"
            value={data.operating_margin}
            change={data.operating_margin_yoy}
            isPercent
          />

          <KeyFigure
            label="Free cash flow"
            value={data.free_cash_flow}
            change={data.free_cash_flow_yoy}
          />
          <KeyFigure
            label="Cash & equivalents"
            value={data.total_cash}
            change={data.total_cash_yoy}
          />
          <KeyFigure
            label="Total debt"
            value={data.total_debt}
            change={data.total_debt_yoy}
          />
          <KeyFigure
            label="Shareholders' equity"
            value={data.equity}
            change={data.equity_yoy}
          />
        </div>

        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 font-medium">
          Change: relative for amounts, percentage points for the margin; green
          and red show direction only.
        </div>
      </div>
    </div>
  );
}