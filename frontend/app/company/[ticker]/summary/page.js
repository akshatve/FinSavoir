"use client";

import React, { useState, useEffect, use } from "react";
import { getSummary } from "../../../../lib/api";
import Link from "next/link";

export default function SummaryAnalysisPage({ params }) {
  const unwrappedParams = use(params);
  const ticker = unwrappedParams.ticker.toUpperCase();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSummary(ticker);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticker]);

  if (loading)
    return (
      <div className="p-12 text-center text-gray-500 animate-pulse">
        Reading the filings and writing the summary...
      </div>
    );
  if (!data) {
    return (
      <div className="p-12 text-center text-red-500">
        Failed to load summary.
      </div>
    );
  }

  if (data.summary.status === "not_supported") {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Summary not yet available for {data.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.summary.message}
          </p>
        </div>
      </div>
    );
  }

  if (data.summary.status !== "ok") {
    return (
      <div className="p-12 text-center text-red-500">
        {data.summary.message || "Failed to load summary."}
      </div>
    );
  }
  const s = data.summary.sections;
  const raw = data.summary.raw;

  // Helper: format currency (billions/millions)
  const fmtCurrency = (val) => {
    if (val === null || val === undefined) return "—";
    if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  const quickStats = [
    {
      label: "Revenue",
      value: raw.revenue,
      color: "text-blue-700 dark:text-blue-700",
    },
    {
      label: "Net Income",
      value: raw.net_income,
      color:
        raw.net_income >= 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400",
    },
    {
      label: "Operating Cash Flow",
      value: raw.operating_cash_flow,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Debt",
      value: raw.total_debt,
      color: "text-red-600 dark:text-red-400",
    },
    {
      label: "Total Assets",
      value: raw.total_assets,
      color: "text-gray-900 dark:text-white",
    },
    {
      label: "Operating Income",
      value: raw.operating_income,
      color: "text-blue-700 dark:text-blue-700",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-2">
      {/* ===== HERO HEADER ===== */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-gray-950 dark:to-purple-950/20 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full">
            Summary Analysis
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            FY{data.summary.fiscal_year} · Auto-Generated
          </span>
        </div>
        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
          Understanding {data.name}
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400 mt-3 max-w-3xl leading-relaxed">
          A plain-language overview of the company's most recent reported
          financials. Written from fixed templates — not by an analyst, not a
          forecast, and not a recommendation.
        </p>
      </div>

      {/* ===== QUICK STATS STRIP ===== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
              {stat.label}
            </p>
            <p className={`text-lg font-black ${stat.color} tabular-nums`}>
              {fmtCurrency(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* ===== MAIN NARRATIVE ===== */}
      <div className="space-y-10">
        {/* 1. OVERVIEW */}
        <section className="flex gap-5">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black flex items-center justify-center shadow-md">
            01
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              What the company reported
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
              {s.overview}
            </p>
          </div>
        </section>

        {/* 2. PROFITABILITY */}
        <section className="flex gap-5">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center shadow-md">
            02
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Growth & Profitability
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
              {s.profitability}
            </p>
          </div>
        </section>

        {/* 3. CASH & DEBT */}
        <section className="flex gap-5">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black flex items-center justify-center shadow-md">
            03
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Cash & Debt Position
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
              {s.cash_and_debt}
            </p>
          </div>
        </section>
      </div>

      {/* ===== STRENGTHS & WATCH ITEMS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {/* Strengths */}
        <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-950 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-lg text-emerald-800 dark:text-emerald-400">
                Main Strengths
              </h4>
              <p className="text-xs text-emerald-700/70 dark:text-emerald-500/70">
                Positive signals from the reported figures
              </p>
            </div>
          </div>
          <ul className="space-y-3">
            {s.strengths.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
              >
                <span className="text-emerald-500 font-black mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Watch Items */}
        <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-950 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-md">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-lg text-amber-800 dark:text-amber-400">
                What to Watch
              </h4>
              <p className="text-xs text-amber-700/70 dark:text-amber-500/70">
                Areas that may deserve further investigation
              </p>
            </div>
          </div>
          <ul className="space-y-3">
            {s.watch_items.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
              >
                <span className="text-amber-500 font-black mt-0.5">!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ===== FULL-WIDTH FILING SNAPSHOT ===== */}
      <div className="mt-12 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-5 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Filing Snapshot
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Raw reported figures that back the narrative above.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800">
          <div className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
              Revenue
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums">
              {fmtCurrency(raw.revenue)}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
              Operating Income
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums">
              {fmtCurrency(raw.operating_income)}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
              Net Income
            </p>
            <p
              className={`text-xl font-black tabular-nums ${raw.net_income >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {fmtCurrency(raw.net_income)}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
              Total Assets
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums">
              {fmtCurrency(raw.total_assets)}
            </p>
          </div>
        </div>
      </div>

      {/* ===== HOW TO READ THIS ===== */}
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
          How to read this summary
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
          This page describes what the company reported to the SEC in its most
          recent annual filing. Every sentence is generated by fixed rules from
          the raw numbers above.
        </p>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5 list-disc list-inside">
          <li>It is not a forecast of future performance.</li>
          <li>
            It is not investment advice — only a description of reported
            figures.
          </li>
          <li>Accounting choices and one-off items are not adjusted.</li>
          <li>For a deeper quantitative view, see the Pro Score tab.</li>
        </ul>
      </div>

      {/* ===== FOOTER CTA ===== */}
      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
          Analysis generated on{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          · Data source: SEC EDGAR XBRL filings
        </p>
        <Link
          href={`/company/${ticker}/pro-score`}
          className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-blue-500/20"
        >
          View the full Pro Score for {ticker}
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
