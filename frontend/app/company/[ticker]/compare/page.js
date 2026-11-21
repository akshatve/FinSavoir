"use client";

import { useState, useEffect, use, useRef } from "react";
import { compareCompanies, getComparisonHistory, searchCompanies, getCompanyOverview, getSectorCompanies } from "../../../../lib/api";
import { formatNumber, formatCurrency, formatLargeCurrency, formatPercent } from "../../../../lib/format";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ComparePage({ params }) {
  const unwrappedParams = use(params);
  const ticker = unwrappedParams.ticker.toUpperCase();

  const [peerTicker, setPeerTicker] = useState("");
  const [data, setData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [period, setPeriod] = useState("1y");

  // Search Dropdown State
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Recommended peers
  const [recommendedPeers, setRecommendedPeers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Current company overview
  const [currentCompany, setCurrentCompany] = useState(null);

  // === Load current company + recommended peers ===
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const overview = await getCompanyOverview(ticker);
        setCurrentCompany(overview);

        // Fetch sector peers
        if (overview.sector && overview.sector !== "N/A") {
          try {
            const sectorRes = await getSectorCompanies(overview.sector);
            const peers = (sectorRes.companies || [])
              .filter((c) => c.ticker !== ticker)
              .slice(0, 5)
              .map((c) => ({
                ticker: c.ticker,
                name: c.name,
                sector: c.sector,
              }));
            setRecommendedPeers(peers);
          } catch (err) {
            console.error("Failed to load sector peers", err);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadCompanyData();
  }, [ticker]);

  // === Handle input search debounce ===
  useEffect(() => {
    if (peerTicker.length < 1) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await searchCompanies(peerTicker);
        const filtered = res.filter((c) => c.ticker !== ticker);
        setSuggestions(filtered);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [peerTicker, ticker]);

  // === Close dropdown on outside click ===
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === Fetch comparison history ===
  useEffect(() => {
    if (!data) return;

    const fetchHistory = async () => {
      try {
        const res = await getComparisonHistory(ticker, data.company2.ticker, period);
        const formatted = res.map((item) => ({
          ...item,
          displayDate: new Date(item.Date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        }));
        setHistoryData(formatted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [data, period, ticker]);

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!peerTicker) return;

    setLoading(true);
    setError("");
    setShowDropdown(false);
    try {
      const res = await compareCompanies(ticker, peerTicker.toUpperCase());
      setData(res);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPeer = (peerTick) => {
    setPeerTicker(peerTick);
    setShowDropdown(false);
    // Auto-trigger comparison
    setLoading(true);
    setError("");
    compareCompanies(ticker, peerTick)
      .then((res) => setData(res))
      .catch((err) => {
        setError(err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  };

  // === Winner logic ===
  const getWinner = (val1, val2, lowerBetter = false) => {
    if (val1 === null || val2 === null || val1 === val2) return null;
    if (lowerBetter) return val1 < val2 ? 1 : 2;
    return val1 > val2 ? 1 : 2;
  };

  const ComparisonBar = ({ label, val1, val2, formatType, lowerBetter = false }) => {
    if (val1 === null && val2 === null) return null;

    const max = Math.max(Math.abs(val1 || 0), Math.abs(val2 || 0));
    const width1 = max === 0 ? 0 : (Math.abs(val1 || 0) / max) * 100;
    const width2 = max === 0 ? 0 : (Math.abs(val2 || 0) / max) * 100;
    const winner = getWinner(val1, val2, lowerBetter);

    const format = (v) => {
      if (v === null || v === undefined) return "—";
      if (formatType === "largeCurrency") return formatLargeCurrency(v);
      if (formatType === "currency") return formatCurrency(v);
      if (formatType === "percent") return formatPercent(v);
      return formatNumber(v);
    };

    return (
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">
          {label}
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                {data.company1.ticker}
                {winner === 1 && (
                  <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                    ✓ Winner
                  </span>
                )}
              </span>
              <span className={`font-bold tabular-nums ${winner === 1 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}>
                {format(val1)}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-1000 ${winner === 1 ? "bg-gradient-to-r from-blue-500 to-emerald-500" : "bg-blue-500"}`}
                style={{ width: `${width1}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-bold text-orange-500 dark:text-orange-400 flex items-center gap-2">
                {data.company2.ticker}
                {winner === 2 && (
                  <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                    ✓ Winner
                  </span>
                )}
              </span>
              <span className={`font-bold tabular-nums ${winner === 2 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}>
                {format(val2)}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-1000 ${winner === 2 ? "bg-gradient-to-r from-orange-500 to-emerald-500" : "bg-orange-500"}`}
                style={{ width: `${width2}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const periods = [
    { label: "1M", value: "1mo" },
    { label: "6M", value: "6mo" },
    { label: "1Y", value: "1y" },
    { label: "5Y", value: "5y" },
  ];

  return (
    <div className="space-y-8">

      {/* ===== SEARCH HEADER ===== */}
      <div className="bg-gradient-to-br from-white via-white to-white dark:from-blue-950/20 dark:via-gray-950 dark:to-orange-950/20 border border-gray-200 dark:border-gray-800 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
            Peer Comparison
          </span>
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
          Compare {ticker} with any company
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">
          See how the two companies stack up on revenue, market cap, valuation, and total return over time.
        </p>

        <form onSubmit={handleCompare} className="flex gap-3 max-w-xl relative" ref={searchRef}>
          <div className="flex-1 relative">
            <input
              type="text"
              value={peerTicker}
              onChange={(e) => setPeerTicker(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by ticker or company name (e.g., MSFT)"
              className="w-full px-5 py-3.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white font-medium shadow-sm"
            />

            {/* ===== DROPDOWN ===== */}
            {showDropdown && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">

                {/* CASE 1: User is typing — show search results */}
                {peerTicker.length > 0 && suggestions.length > 0 && (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Search Results
                      </p>
                    </div>
                    {suggestions.map((company) => (
                      <button
                        key={company.ticker}
                        type="button"
                        onClick={() => handleSelectPeer(company.ticker)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                            {company.ticker}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                            {company.name}
                          </span>
                        </div>
                        {/* <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                          {company.sector}
                        </span> */}
                      </button>
                    ))}
                  </>
                )}

                {/* CASE 2: User typed but no results */}
                {peerTicker.length > 0 && suggestions.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No companies found.
                  </div>
                )}

                {/* CASE 3: Empty input — show recommended peers */}
                {peerTicker.length === 0 && recommendedPeers.length > 0 && (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-950/20">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                        Recommended Peers · {currentCompany?.sector || "Same Sector"}
                      </p>
                    </div>
                    {recommendedPeers.map((company) => (
                      <button
                        key={company.ticker}
                        type="button"
                        onClick={() => handleSelectPeer(company.ticker)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900 dark:text-white bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {company.ticker}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                            {company.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          Compare →
                        </span>
                      </button>
                    ))}
                  </>
                )}

                {/* CASE 4: Empty input but no recommended peers loaded yet */}
                {peerTicker.length === 0 && recommendedPeers.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    Start typing to search any company...
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !peerTicker}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-blue-500/20"
          >
            {loading ? "Comparing..." : "Compare →"}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-3 font-medium">{error}</p>}
      </div>

      {/* ===== EMPTY STATE ===== */}
      {!data && !loading && (
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pick a company to compare</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
            Click the search box above to see recommended peers from the same sector, or type any ticker.
          </p>
          {recommendedPeers.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {recommendedPeers.slice(0, 3).map((peer) => (
                <button
                  key={peer.ticker}
                  onClick={() => handleSelectPeer(peer.ticker)}
                  className="px-3 py-1.5 text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  Compare with {peer.ticker}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== RESULTS (unchanged) ===== */}
      {data && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* HERO VERSUS HEADER */}
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 relative overflow-hidden">
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded">
                    Current
                  </span>
                </div>
                <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{data.company1.ticker}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{data.company1.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3 tabular-nums">
                  {data.company1.price ? formatCurrency(data.company1.price) : "—"}
                </p>
              </div>

              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white font-black text-xl flex items-center justify-center shadow-xl">
                  VS
                </div>
              </div>

              <div className="flex-1 text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end gap-3 mb-2">
                  <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded">
                    Peer
                  </span>
                </div>
                <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{data.company2.ticker}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{data.company2.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3 tabular-nums">
                  {data.company2.price ? formatCurrency(data.company2.price) : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* TOTAL RETURN CHART */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-6 shadow-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Total Return</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Cumulative return of {data.company1.ticker} vs {data.company2.ticker}, rebased to 0%
                </p>
              </div>
              <div className="flex gap-1.5 bg-gray-800/50 p-1 rounded-xl border border-gray-700/50">
                {periods.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      period === p.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[400px] w-full">
              {historyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: "#9ca3af" }} tickLine={false} axisLine={false} minTickGap={50} />
                    <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val.toFixed(0)}%`} orientation="right" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#374151", color: "#fff", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                      formatter={(value, name) => [`${value.toFixed(2)}%`, name === "Ticker1_Return" ? data.company1.ticker : data.company2.ticker]}
                      labelStyle={{ color: "#9ca3af", marginBottom: "4px", fontWeight: "bold" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} formatter={(value) => (value === "Ticker1_Return" ? data.company1.ticker : data.company2.ticker)} iconType="circle" />
                    <Line type="monotone" dataKey="Ticker1_Return" stroke="#60a5fa" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: "#60a5fa" }} />
                    <Line type="monotone" dataKey="Ticker2_Return" stroke="#fb923c" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: "#fb923c" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">Loading chart...</div>
              )}
            </div>
          </div>

          {/* METRIC BARS */}
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Head-to-Head Metrics</h3>
            <p className="text-sm text-gray-500 mb-8">Each metric shows which company leads. Green = winner.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <ComparisonBar label="Market Cap" val1={data.company1.market_cap} val2={data.company2.market_cap} formatType="largeCurrency" />
                <ComparisonBar label="Revenue (TTM)" val1={data.company1.revenue} val2={data.company2.revenue} formatType="largeCurrency" />
                <ComparisonBar label="P/E Ratio" val1={data.company1.pe_ratio} val2={data.company2.pe_ratio} formatType="number" lowerBetter={true} />
              </div>
              <div>
                <ComparisonBar label="Profit Margin" val1={data.company1.profit_margin} val2={data.company2.profit_margin} formatType="percent" />
                <ComparisonBar label="Dividend Yield" val1={data.company1.dividend_yield} val2={data.company2.dividend_yield} formatType="percent" />
                <ComparisonBar label="Beta (Volatility)" val1={data.company1.beta} val2={data.company2.beta} formatType="number" lowerBetter={true} />
              </div>
            </div>
          </div>

          {/* HEAD-TO-HEAD TABLE */}
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Full Comparison Table</h3>
              <p className="text-sm text-gray-500 mt-1">All metrics in one place</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30">
                  <tr>
                    <th className="px-6 py-3 font-bold">Metric</th>
                    <th className="px-6 py-3 font-bold text-right text-blue-600 dark:text-blue-400">{data.company1.ticker}</th>
                    <th className="px-6 py-3 font-bold text-right text-orange-500 dark:text-orange-400">{data.company2.ticker}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    { label: "Price", v1: data.company1.price, v2: data.company2.price, fmt: "currency" },
                    { label: "Market Cap", v1: data.company1.market_cap, v2: data.company2.market_cap, fmt: "largeCurrency" },
                    { label: "Revenue (TTM)", v1: data.company1.revenue, v2: data.company2.revenue, fmt: "largeCurrency" },
                    { label: "P/E Ratio", v1: data.company1.pe_ratio, v2: data.company2.pe_ratio, fmt: "number" },
                    { label: "EPS (TTM)", v1: data.company1.eps, v2: data.company2.eps, fmt: "number" },
                    { label: "Profit Margin", v1: data.company1.profit_margin, v2: data.company2.profit_margin, fmt: "percent" },
                    { label: "Dividend Yield", v1: data.company1.dividend_yield, v2: data.company2.dividend_yield, fmt: "percent" },
                    { label: "Beta", v1: data.company1.beta, v2: data.company2.beta, fmt: "number" },
                  ].map((row) => {
                    const fmt = (v) => {
                      if (v === null || v === undefined) return "—";
                      if (row.fmt === "largeCurrency") return formatLargeCurrency(v);
                      if (row.fmt === "currency") return formatCurrency(v);
                      if (row.fmt === "percent") return formatPercent(v);
                      return formatNumber(v);
                    };
                    return (
                      <tr key={row.label} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10">
                        <td className="px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">{row.label}</td>
                        <td className="px-6 py-3 text-right text-gray-900 dark:text-white font-bold tabular-nums">{fmt(row.v1)}</td>
                        <td className="px-6 py-3 text-right text-gray-900 dark:text-white font-bold tabular-nums">{fmt(row.v2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}