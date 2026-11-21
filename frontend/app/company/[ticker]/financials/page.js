"use client";

import { useEffect, useState, use } from "react";
import { getCompanyFinancials } from "../../../../lib/api";
import { formatNumber } from "../../../../lib/format";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function FinancialsPage({ params }) {
  const unwrappedParams = use(params);
  const ticker = unwrappedParams.ticker.toUpperCase();
  
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("annual");
  const [activeTab, setActiveTab] = useState("income"); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      setCurrentPage(1); 
      try {
        const res = await getCompanyFinancials(ticker, period);
        setData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticker, period]);

  // --- CHART DATA ---
  const getChartData = () => {
    const statement = activeTab === "income" ? data?.income_statement : activeTab === "balance" ? data?.balance_sheet : data?.cash_flow;
    if (!statement || Object.keys(statement).length === 0) return [];

    const dates = Object.keys(statement[Object.keys(statement)[0]]).reverse(); 
    return dates.map(date => {
      const rev = statement["Total Revenue"]?.[date] || 0;
      const net = statement["Net Income"]?.[date] || 0;
      const cash = statement["Operating Cash Flow"]?.[date] || 0;
      
      const dateObj = new Date(date);
      const label = period === "quarterly" 
        ? `Q${Math.floor(dateObj.getMonth() / 3) + 1} '${dateObj.getFullYear().toString().slice(2)}` 
        : dateObj.getFullYear().toString();

      return {
        date: label,
        Revenue: rev,
        "Net Income": net,
        "Operating Cash": cash,
      };
    });
  };

  const chartData = data ? getChartData() : [];

  // Extract latest-year stats for the hero strip
  const getLatestStats = () => {
    if (!data?.income_statement) return null;
    const incomeKeys = Object.keys(data.income_statement);
    if (incomeKeys.length === 0) return null;
    const latestYear = Object.keys(data.income_statement[incomeKeys[0]])[0];
    
    return {
      year: latestYear,
      revenue: data.income_statement["Total Revenue"]?.[latestYear],
      netIncome: data.income_statement["Net Income"]?.[latestYear],
      operatingCash: data.cash_flow?.["Operating Cash Flow"]?.[latestYear],
      freeCash: data.cash_flow?.["Free Cash Flow"]?.[latestYear],
    };
  };

  const latest = getLatestStats();

  // --- TABLE RENDERING ---
  const renderTable = (statementData) => {
    if (!statementData || Object.keys(statementData).length === 0) {
      return (
        <div className="p-12 text-center text-gray-500">
          <p>No data available for this statement.</p>
        </div>
      );
    }

    const allLineItems = Object.keys(statementData);
    const dates = Object.keys(statementData[allLineItems[0]]);
    
    const totalPages = Math.ceil(allLineItems.length / rowsPerPage);
    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const currentItems = allLineItems.slice(indexOfFirstItem, indexOfLastItem);

    const formatDateHeader = (dateStr) => {
      const d = new Date(dateStr);
      if (period === "quarterly") {
        return `Q${Math.floor(d.getMonth() / 3) + 1} '${d.getFullYear().toString().slice(2)}`;
      }
      return `FY${d.getFullYear()}`;
    };

    return (
      <div className="flex flex-col">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs border-b border-gray-200 dark:border-gray-800 min-w-[240px]">
                  Line Item
                </th>
                {dates.map(date => (
                  <th key={date} className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs text-right border-b border-gray-200 dark:border-gray-800 whitespace-nowrap">
                    {formatDateHeader(date)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {currentItems.map((item, index) => (
                <tr 
                  key={item} 
                  className={`
                    group border-b border-gray-100 dark:border-gray-800/50 transition-colors
                    ${index % 2 === 0 ? 'bg-transparent' : 'bg-gray-50/40 dark:bg-gray-900/20'}
                    hover:bg-blue-50/60 dark:hover:bg-blue-900/10
                  `}
                >
                  <td className="px-6 py-3.5 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </td>

                  {dates.map(date => {
                    const val = statementData[item][date];
                    const isNegative = val < 0;
                    const isZero = val === 0 || val === null || val === undefined;
                    
                    return (
                      <td 
                        key={date} 
                        className={`px-6 py-3.5 text-right tabular-nums font-medium transition-colors ${
                          isZero ? 'text-gray-400 dark:text-gray-600' :
                          isNegative ? 'text-red-600 dark:text-red-400' : 
                          'text-gray-900 dark:text-white'
                        }`}
                      >
                        {isZero ? "—" : formatNumber(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Showing <span className="text-gray-900 dark:text-white font-bold">{indexOfFirstItem + 1}–{Math.min(indexOfLastItem, allLineItems.length)}</span> of <span className="font-bold">{allLineItems.length}</span> line items
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                Prev
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[28px] h-7 text-xs font-bold rounded-md transition-all ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-sm"
              >
                Next
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* ===== HERO STATS STRIP ===== */}
      {latest && !loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
              Revenue · {period === "quarterly" ? "Q" : "FY"}{latest.year.slice(0,4)}
            </p>
            <p className="text-2xl font-black tabular-nums">{latest.revenue ? formatNumber(latest.revenue) : "—"}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Net Income</p>
            <p className="text-2xl font-black tabular-nums">{latest.netIncome ? formatNumber(latest.netIncome) : "—"}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/20">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Operating Cash Flow</p>
            <p className="text-2xl font-black tabular-nums">{latest.operatingCash ? formatNumber(latest.operatingCash) : "—"}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Free Cash Flow</p>
            <p className="text-2xl font-black tabular-nums">{latest.freeCash ? formatNumber(latest.freeCash) : "—"}</p>
          </div>
        </div>
      )}

      {/* ===== CONTROLS ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Sub-tab switcher */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
          {[
            { key: "income", label: "Income", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
            { key: "balance", label: "Balance", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
            { key: "cash", label: "Cash Flow", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          ].map(tab => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.key 
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Period switcher */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
          <button 
            onClick={() => setPeriod("annual")} 
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              period === "annual" 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Annual
          </button>
          <button 
            onClick={() => setPeriod("quarterly")} 
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              period === "quarterly" 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Quarterly
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="p-6 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/40">
          {error}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          
          {/* CHART */}
          <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </span>
                  {activeTab === "income" && "Revenue vs Net Income"}
                  {activeTab === "balance" && "Assets & Liabilities"}
                  {activeTab === "cash" && "Operating Cash Flow"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Source: Yahoo Finance</p>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-900 text-gray-500 rounded">
                {period === "quarterly" ? "Quarterly" : "Annual"} View
              </span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} tickFormatter={(val) => formatNumber(val)} orientation="right" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '8px', fontSize: '12px' }} 
                    formatter={(value) => formatNumber(value)}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="Revenue" fill="url(#colorRevenue)" radius={[6, 6, 0, 0]} barSize={40} />
                  <Line type="monotone" dataKey={activeTab === "cash" ? "Operating Cash" : "Net Income"} stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {activeTab === "income" && renderTable(data?.income_statement)}
            {activeTab === "balance" && renderTable(data?.balance_sheet)}
            {activeTab === "cash" && renderTable(data?.cash_flow)}
          </div>

        </div>
      )}
    </div>
  );
}