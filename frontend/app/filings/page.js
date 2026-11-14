"use client";

import { useState, useEffect } from "react";
import { getAllFilings } from "../../lib/api";
import { motion } from "framer-motion";

export default function FilingsPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [formType, setFormType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [filingsData, setFilingsData] = useState({ filings: [], total_pages: 1, total_filings: 0 });
  const [loading, setLoading] = useState(true);

  // Form types to filter by
  const formTypes = ["All", "10-K", "10-Q", "8-K", "4"];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch data when page, form type, or query changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllFilings(currentPage, 20, formType, debouncedQuery);
        setFilingsData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, formType, debouncedQuery]);

  // Helper to get badge color for each form type
  const getFormStyle = (form) => {
    if (form.startsWith("10-K")) return { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", label: "Annual" };
    if (form.startsWith("10-Q")) return { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-400", label: "Quarterly" };
    if (form.startsWith("8-K")) return { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", label: "Current" };
    if (form.startsWith("4")) return { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", label: "Insider" };
    return { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300", label: "Other" };
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= filingsData.total_pages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Live Feed</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            SEC Filings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Real-time documents straight from SEC EDGAR. Every filing that matters, as it happens.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Filings</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{filingsData.total_filings}</p>
          </div>
          <div className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Page</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {filingsData.total_pages > 0 ? `${filingsData.current_page} of ${filingsData.total_pages}` : "0 of 0"}
            </p>
          </div>
          <div className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Data Source</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">SEC EDGAR</p>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          {/* Form Type Tabs */}
          <div className="flex flex-wrap gap-2 bg-white dark:bg-[#111] p-1 rounded-xl border border-gray-200 dark:border-gray-800 w-fit">
            {formTypes.map(type => (
              <button
                key={type}
                onClick={() => { setFormType(type); setCurrentPage(1); }}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  formType === type
                    ? "bg-[#094cb9] text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company or form..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#094cb9] text-gray-900 dark:text-white placeholder-gray-400 text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Filings Table */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Form</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Company</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Time</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-4">
                        <div className="h-8 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>
                      </td>
                    </tr>
                  ))
                ) : filingsData.filings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                      No filings found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filingsData.filings.map((filing, index) => {
                    const style = getFormStyle(filing.form_type);
                    return (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${style.bg} ${style.text}`}>
                              {filing.form_type}
                            </span>
                            <span className="text-xs text-gray-400 hidden sm:block">{style.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 dark:text-white group-hover:text-[#094cb9] transition-colors">
                            {filing.company}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400 text-xs font-semibold">
                          {filing.time_ago}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a
                            href={filing.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#094cb9] dark:text-[#094cb9] hover:underline"
                          >
                            Open
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </a>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filingsData.total_pages > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-500 font-medium">
                Page <span className="text-blue-600 font-bold">{filingsData.current_page}</span> of <span className="font-bold">{filingsData.total_pages}</span>
                <span className="ml-2 text-gray-400">({filingsData.total_filings} filings)</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 text-sm font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === filingsData.total_pages || loading}
                  className="px-4 py-2 text-sm font-bold bg-[#094cb9] text-white rounded-lg hover:bg-[#094cb9] disabled:opacity-40 transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}