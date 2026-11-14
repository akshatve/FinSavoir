"use client";

import { useState, useEffect, use, useRef } from "react";
import { compareCompanies, getComparisonHistory, searchCompanies } from "../../../../lib/api";
import { formatNumber, formatCurrency, formatPercent } from "../../../../lib/format";
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Search Debounce
  useEffect(() => {
    if (peerTicker.length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await searchCompanies(peerTicker);
        // Filter out the current company being viewed
        const filtered = res.filter(c => c.ticker !== ticker);
        setSuggestions(filtered);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [peerTicker, ticker]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch comparison history when data or period changes
  useEffect(() => {
    if (!data) return;
    
    const fetchHistory = async () => {
      try {
        const res = await getComparisonHistory(ticker, data.company2.ticker, period);
        const formatted = res.map(item => ({
          ...item,
          displayDate: new Date(item.Date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
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

  const selectSuggestion = (suggestedTicker) => {
    setPeerTicker(suggestedTicker);
    setShowDropdown(false);
  };

  const ComparisonBar = ({ label, val1, val2, formatType }) => {
    if (val1 === null && val2 === null) return null;

    const max = Math.max(val1 || 0, val2 || 0);
    const width1 = max === 0 ? 0 : ((val1 || 0) / max) * 100;
    const width2 = max === 0 ? 0 : ((val2 || 0) / max) * 100;

    const format = (v) => {
      if (v === null || v === undefined) return "N/A";
      if (formatType === "currency") return formatCurrency(v);
      if (formatType === "percent") return formatPercent(v);
      return formatNumber(v);
    };

    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
          {label}
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-bold text-blue-600 dark:text-blue-400">{data.company1.ticker}</span>
              <span className="font-medium text-gray-900 dark:text-white">{format(val1)}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
              <div className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${width1}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-bold text-orange-500 dark:text-orange-400">{data.company2.ticker}</span>
              <span className="font-medium text-gray-900 dark:text-white">{format(val2)}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
              <div className="bg-orange-500 dark:bg-orange-400 h-3 rounded-full transition-all duration-1000" style={{ width: `${width2}%` }}></div>
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
      
      {/* Header & Search */}
      <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Peer Comparison</h2>
        
        <form onSubmit={handleCompare} className="flex gap-3 max-w-md mt-4 relative" ref={searchRef}>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={peerTicker}
              onChange={(e) => setPeerTicker(e.target.value)}
              placeholder="Enter ticker (e.g., MSFT)"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white"
            />
            
            {/* Autocomplete Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-12 left-0 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden z-50">
                {suggestions.map((company) => (
                  <button
                    key={company.ticker}
                    type="button"
                    onClick={() => selectSuggestion(company.ticker)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors text-left"
                  >
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white mr-2">{company.ticker}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{company.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">{company.sector}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading ? "Comparing..." : "Compare"}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      {/* Results */}
      {data && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* TOTAL RETURN CHART */}
          <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Total Return (%)</h3>
                <p className="text-sm text-gray-500">Comparing {data.company1.ticker} vs {data.company2.ticker}</p>
              </div>
              <div className="flex gap-2">
                {periods.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${period === p.value ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900" : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400"}`}
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} minTickGap={50} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val.toFixed(0)}%`} orientation="right" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                      formatter={(value, name) => [`${value.toFixed(2)}%`, name === 'Ticker1_Return' ? data.company1.ticker : data.company2.ticker]}
                      labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => value === 'Ticker1_Return' ? data.company1.ticker : data.company2.ticker} />
                    <Line type="monotone" dataKey="Ticker1_Return" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Ticker2_Return" stroke="#ea580c" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">Loading chart...</div>
              )}
            </div>
          </div>

          {/* METRIC BARS */}
          <div className="bg-white dark:bg-gray-950 p-6 md:p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <ComparisonBar label="Market Cap" val1={data.company1.market_cap} val2={data.company2.market_cap} formatType="number" />
                <ComparisonBar label="Revenue (TTM)" val1={data.company1.revenue} val2={data.company2.revenue} formatType="number" />
                <ComparisonBar label="P/E Ratio" val1={data.company1.pe_ratio} val2={data.company2.pe_ratio} formatType="number" />
              </div>
              <div>
                <ComparisonBar label="Profit Margin" val1={data.company1.profit_margin} val2={data.company2.profit_margin} formatType="percent" />
                <ComparisonBar label="Dividend Yield" val1={data.company1.dividend_yield} val2={data.company2.dividend_yield} formatType="percent" />
                <ComparisonBar label="Beta (Volatility)" val1={data.company1.beta} val2={data.company2.beta} formatType="number" />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}