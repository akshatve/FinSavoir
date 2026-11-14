"use client";

import React, { useState, useEffect, use } from "react";
import { getFilings } from "../../../../lib/api";

export default function FilingsPage({ params }) {
  const unwrappedParams = use(params);
  const ticker = unwrappedParams.ticker.toUpperCase();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getFilings(ticker);
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/40">
        {error}
      </div>
    );
  }

  // NEW: Handle missing CIK case
  if (data?.cik === null && data?.message) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Filings not yet available for {data.name}
          </h2>
          <p className="te  xt-sm text-gray-600 dark:text-gray-400">
            {data.message}
          </p>
        </div>
      </div>
    );
  }

  const filings = data?.filings || [];
  const formTypes = ["All", ...new Set(filings.map((f) => f.form_type))];
  const filteredFilings =
    filter === "All" ? filings : filings.filter((f) => f.form_type === filter);

  // Helper to format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper to color-code form types
  const getFormBadge = (form) => {
    if (form === "10-K" || form === "20-F" || form === "40-F")
      return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
    if (form === "10-Q")
      return "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300";
    if (form === "8-K")
      return "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300";
    if (form === "DEF 14A")
      return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300";
    return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* ===== HEADER ===== */}
      <div className="bg-gradient-to-br from-white via-white to-white dark:from-blue-950/20 dark:via-gray-950 dark:to-indigo-950/20 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
            SEC Filings
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            CIK: {data.cik}
          </span>
        </div>
        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          {data.name} — Filing History
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-3 max-w-3xl leading-relaxed">
          Every document {data.name} has filed with the U.S. Securities and
          Exchange Commission. Click any filing to open the original document on
          SEC.gov.
        </p>
      </div>

      {/* ===== FILTER TABS ===== */}
      <div className="flex flex-wrap gap-2 mb-6">
        {formTypes.map((form) => (
          <button
            key={form}
            onClick={() => setFilter(form)}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
              filter === form
                ? "bg-[#094cb9] text-white shadow-md shadow-blue-500/20"
                : "bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-blue-300"
            }`}
          >
            {form}
          </button>
        ))}
      </div>

      {/* ===== FILINGS TABLE ===== */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Form Type</th>
                <th className="px-6 py-4 font-bold">Description</th>
                <th className="px-6 py-4 font-bold">Filed Date</th>
                <th className="px-6 py-4 font-bold">Period</th>
                <th className="px-6 py-4 font-bold text-right">Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredFilings.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No filings found.
                  </td>
                </tr>
              ) : (
                filteredFilings.map((filing, i) => (
                  <tr
                    key={i}
                    className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${getFormBadge(filing.form_type)}`}
                      >
                        {filing.form_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                      {filing.description}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 tabular-nums">
                      {formatDate(filing.filed_date)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 tabular-nums">
                      {formatDate(filing.report_date)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={filing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md transition-colors"
                      >
                        Open
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== INFO BOX ===== */}
      <div className="mt-8 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-6">
        <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          About SEC filings
        </h4>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            <strong className="text-blue-700 dark:text-blue-400">10-K</strong> —
            Annual report. Comprehensive summary of a company's financial
            performance.
          </li>
          <li>
            <strong className="text-purple-700 dark:text-purple-400">
              10-Q
            </strong>{" "}
            — Quarterly report. Financial statements issued three times a year.
          </li>
          <li>
            <strong className="text-amber-700 dark:text-amber-400">8-K</strong>{" "}
            — Current report. Filed within 4 business days of major events
            (earnings, M&A, executive changes).
          </li>
          <li>
            <strong className="text-emerald-700 dark:text-emerald-400">
              DEF 14A
            </strong>{" "}
            — Proxy statement. Contains information about executive compensation
            and shareholder votes.
          </li>
        </ul>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
        All filings sourced from SEC EDGAR. Data reflects the latest available
        filings.
      </div>
    </div>
  );
}
