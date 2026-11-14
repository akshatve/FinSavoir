"use client";

import { useState, useEffect } from "react";
import { getPressReleases } from "../../lib/api";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PressReleasesPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filingsData, setFilingsData] = useState({ filings: [], total_pages: 1, total_filings: 0 });
  const [loading, setLoading] = useState(true);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch 8-K filings (Press Releases)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Force form_type to "8-K" to only get press releases
const data = await getPressReleases(currentPage, 20, debouncedQuery);
        setFilingsData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, debouncedQuery]);

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Official Announcements</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            Press Releases
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Official company announcements and earnings releases, sourced directly from SEC 8-K filings.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company by name..."
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#094cb9] text-gray-900 dark:text-white placeholder-gray-400 text-base shadow-sm"
          />
        </div>

        {/* Press Releases Table */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Company</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Type</th>
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
                      No press releases found.
                    </td>
                  </tr>
                ) : (
                  filingsData.filings.map((filing, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-[#094cb9] transition-colors">
                          {filing.company}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                          {filing.form_type}
                        </span>
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filingsData.total_pages > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-500 font-medium">
                Page <span className="text-blue-600 font-bold">{filingsData.current_page}</span> of <span className="font-bold">{filingsData.total_pages}</span>
                <span className="ml-2 text-gray-400">({filingsData.total_filings} releases)</span>
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
                  className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-all shadow-sm"
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