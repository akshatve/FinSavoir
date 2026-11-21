"use client";

import { useCachedData } from "../../lib/useCachedData";
import { getLatestSECFilings } from "../../lib/api";
import { motion } from "framer-motion";

export default function SECFilings() {
  const { data: filings, loading } = useCachedData(
    "sec_filings_cache",
    getLatestSECFilings,
    5,
  );

  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-900 rounded-3xl animate-pulse"></div>
    );
  }

  if (!filings || filings.length === 0) return null;

  // Color coded form types
  const getFormStyle = (form) => {
    if (form.startsWith("10-K"))
      return { bg: "bg-blue-500", text: "text-white", label: "Annual Report" };
    if (form.startsWith("10-Q"))
      return {
        bg: "bg-indigo-500",
        text: "text-white",
        label: "Quarterly Report",
      };
    if (form.startsWith("8-K"))
      return {
        bg: "bg-amber-500",
        text: "text-white",
        label: "Current Report",
      };
    if (form.startsWith("4"))
      return {
        bg: "bg-emerald-500",
        text: "text-white",
        label: "Insider Trade",
      };
    return { bg: "bg-gray-500", text: "text-white", label: "Filing" };
  };

  return (
    <section className="w-full bg-white dark:bg-[#0a0a0a] border-y border-gray-200 dark:border-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Live Feed
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Latest SEC Filings
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              The latest documents filed on SEC EDGAR
            </p>
          </div>

          <a
            href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            View on SEC EDGAR
            <svg
              className="w-4 h-4"
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
        </div>

        {/* Filings Grid - Horizontal Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {filings.map((filing, index) => {
            const style = getFormStyle(filing.form_type);
            return (
              <motion.a
                key={index}
                href={filing.link}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden flex flex-col justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 min-h-[140px]"
              >
                {/* Colored Top Bar — full width, no radius, clipped by parent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${style.bg}`}
                ></div>

                <div className="pt-2">
                  {/* Form Type Badge */}
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-bold rounded-md ${style.bg} ${style.text} mb-3`}
                  >
                    {filing.form_type}
                  </span>

                  {/* Form Label */}
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {style.label}
                  </p>

                  {/* Company Name */}
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {filing.company}
                  </p>
                </div>

                {/* Time Ago */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-500">
                    {filing.time_ago}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <p>Source: SEC EDGAR · Official U.S. Government filings</p>
          <p className="font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Auto-updates every 5 min
          </p>
        </div>
      </div>
    </section>
  );
}
