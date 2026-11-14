"use client";

import React, { useState, useEffect, use } from "react";
import { getProScore } from "../../../../lib/api";

// Reusable circular score gauge component
function ScoreGauge({ score, label, colorClass, subtitle }) {
  const circumference = 2 * Math.PI * 45; // radius 45
  const strokeDashoffset =
    score !== null
      ? circumference - (score / 100) * circumference
      : circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-100 dark:text-gray-800"
          />
          {/* Progress ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${colorClass}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {score !== null ? score : "—"}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            /100
          </span>
        </div>
      </div>
      <p className="text-sm font-bold text-gray-900 dark:text-white mt-3">
        {label}
      </p>
      <p className="text-xs text-gray-500 text-center mt-1 max-w-[200px]">
        {subtitle}
      </p>
    </div>
  );
}

export default function ProScorePage({ params }) {
  const unwrappedParams = use(params);
  const ticker = unwrappedParams.ticker.toUpperCase();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatValue = (key, val) => {
    if (val === null || val === undefined) return "—";
    if (key.includes("years")) return val === 1 ? "1 year" : `${val} years`;
    if (key.includes("coverage")) return `${val.toFixed(2)}x`;
    if (key.includes("dilution")) return `${(val * 100).toFixed(1)}%`;
    return `${(val * 100).toFixed(1)}%`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProScore(ticker);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticker]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 animate-pulse">
        Calculating Pro Score...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Data not available
        </h2>
        <p className="text-sm text-gray-500">
          We couldn't load the Pro Score for this company.
        </p>
      </div>
    );
  }

  // NEW: Handle not_supported status
  if (data.financial_quality.status === "not_supported") {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Pro Score not yet available for {data.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg mx-auto">
            {data.financial_quality.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-6 max-w-md mx-auto">
            This is not an error — it means FinSavoir's scoring model is not yet
            calibrated for this company's sector. We're working on adding bank,
            REIT, and insurer models.
          </p>
        </div>
      </div>
    );
  }

  const qualitySupports =
    data.financial_quality.measures?.filter((m) => m.points >= 70) || [];
  const qualityRisks =
    data.financial_quality.measures?.filter((m) => m.points < 40) || [];
  const riskRisks =
    data.business_risk.measures?.filter((m) => m.points >= 50) || [];

  const getScoreColor = (score, reverse = false) => {
    if (score === null) return "text-gray-300";
    if (reverse) {
      // For business risk, higher = safer
      return score >= 70
        ? "text-emerald-500"
        : score >= 40
          ? "text-yellow-500"
          : "text-red-500";
    }
    return score >= 70
      ? "text-emerald-500"
      : score >= 40
        ? "text-yellow-500"
        : "text-red-500";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* HEADER */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="flex items-center gap-3 mb-2">
          {/* <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md">
            Pro Score
          </span> */}
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Descriptive ·{" "}
            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md">
              Not Investment Advice
            </span>
          </span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {data.name}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-3xl">
          FinSavoir's automated, model-generated assessment. Each score places
          this company's reported numbers on a 0–100 scale with published rules.{" "}
          <strong className="text-gray-700 dark:text-gray-300">
            80/100 does not mean an 80% chance of profit or safety.
          </strong>{" "}
          <a
            href={`/company/${ticker}/pro-score/methodology`}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            Read the methodology.
          </a>
        </p>
      </div>

      {/* SCORE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Quality Card */}
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm flex flex-col sm:flex-row items-center gap-8">
          <ScoreGauge
            score={data.financial_quality.score}
            label="Financial Quality"
            colorClass={getScoreColor(data.financial_quality.score)}
            subtitle="Higher = stronger historical fundamentals."
          />
          <div className="flex-1 space-y-3 w-full">
            <div className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
              <span className="text-gray-500">Status</span>
              <span
                className={`font-bold ${data.financial_quality.score !== null ? "text-emerald-600 dark:text-emerald-400" : "text-orange-500"}`}
              >
                {data.financial_quality.score !== null
                  ? "Scored"
                  : "Insufficient Data"}
              </span>
            </div>
            <div className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
              <span className="text-gray-500">Measures Used</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {data.financial_quality.measures?.length || 0} / 9
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Data Source</span>
              <span className="font-bold text-gray-900 dark:text-white">
                SEC EDGAR
              </span>
            </div>
          </div>
        </div>

        {/* Business Risk Card */}
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm flex flex-col sm:flex-row items-center gap-8">
          <ScoreGauge
            score={data.business_risk.score}
            label="Business Risk"
            colorClass={getScoreColor(data.business_risk.score, true)}
            subtitle="Higher = more measured risk (safer)."
          />
          <div className="flex-1 space-y-3 w-full">
            <div className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
              <span className="text-gray-500">Status</span>
              <span
                className={`font-bold ${data.business_risk.score !== null ? "text-emerald-600 dark:text-emerald-400" : "text-orange-500"}`}
              >
                {data.business_risk.score !== null
                  ? "Scored"
                  : "Insufficient Data"}
              </span>
            </div>
            <div className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
              <span className="text-gray-500">Measures Used</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {data.business_risk.measures?.length || 0} / 7
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Scope</span>
              <span className="font-bold text-gray-900 dark:text-white">
                Filings Only
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT SUPPORTS & INCREASES RISK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supports */}
        <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-950 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6">
          <h4 className="font-bold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2 text-lg">
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
            What Supports the Case
          </h4>
          <ul className="space-y-3">
            {qualitySupports.map((m, i) => (
              <li
                key={i}
                className="flex justify-between items-start gap-3 text-sm py-2 border-b border-emerald-100/50 dark:border-emerald-900/20 last:border-0"
              >
                <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">
                  {m.key.replace(/_/g, " ")}
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                  {formatValue(m.key, m.value)}{" "}
                  <span className="text-xs text-gray-400 ml-1">
                    ({m.points} pts)
                  </span>
                </span>
              </li>
            ))}
            {qualitySupports.length === 0 && (
              <li className="text-sm text-gray-500 py-4 text-center">
                No strong supports found.
              </li>
            )}
          </ul>
        </div>

        {/* Increases Risk */}
        <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-gray-950 border border-red-100 dark:border-red-900/30 rounded-2xl p-6">
          <h4 className="font-bold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2 text-lg">
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
            What Increases Risk
          </h4>
          <ul className="space-y-3">
            {qualityRisks.map((m, i) => (
              <li
                key={`q-${i}`}
                className="flex justify-between items-start gap-3 text-sm py-2 border-b border-red-100/50 dark:border-red-900/20"
              >
                <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">
                  {m.key.replace(/_/g, " ")}
                </span>
                <span className="font-bold text-red-700 dark:text-red-400 whitespace-nowrap">
                  {formatValue(m.key, m.value)}{" "}
                  <span className="text-xs text-gray-400 ml-1">
                    ({m.points} pts)
                  </span>
                </span>
              </li>
            ))}
            {riskRisks.map((m, i) => (
              <li
                key={`r-${i}`}
                className="flex justify-between items-start gap-3 text-sm py-2 border-b border-red-100/50 dark:border-red-900/20 last:border-0"
              >
                <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">
                  {m.key.replace(/_/g, " ")}
                </span>
                <span className="font-bold text-red-700 dark:text-red-400 whitespace-nowrap">
                  {formatValue(m.key, m.value)}{" "}
                  <span className="text-xs text-gray-400 ml-1">
                    ({m.points} risk pts)
                  </span>
                </span>
              </li>
            ))}
            {qualityRisks.length === 0 && riskRisks.length === 0 && (
              <li className="text-sm text-gray-500 py-4 text-center">
                No major risks found.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* DETAILED TABLES */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
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
            Financial Quality: How Each Measure Contributes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-bold">Measure</th>
                <th className="px-6 py-3 font-bold text-right">Value</th>
                <th className="px-6 py-3 font-bold text-center">Points</th>
                <th className="px-6 py-3 font-bold text-right">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.financial_quality.measures?.map((m, i) => (
                <tr
                  key={i}
                  className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group"
                >
                  <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200 capitalize">
                    {m.key.replace(/_/g, " ")}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-gray-600 dark:text-gray-400">
                    {formatValue(m.key, m.value)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-14 py-1 rounded-lg text-xs font-bold ${m.points >= 70 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : m.points >= 40 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"}`}
                    >
                      {m.points}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 font-medium">
                    {(m.weight * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BUSINESS RISK TABLE */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500"
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
            Business Risk: How Each Measure Contributes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-bold">Measure</th>
                <th className="px-6 py-3 font-bold text-right">Value</th>
                <th className="px-6 py-3 font-bold text-center">Risk Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.business_risk.measures?.map((m, i) => (
                <tr
                  key={i}
                  className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors group"
                >
                  <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200 capitalize">
                    {m.key.replace(/_/g, " ")}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-gray-600 dark:text-gray-400">
                    {formatValue(m.key, m.value)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-14 py-1 rounded-lg text-xs font-bold ${m.points >= 70 ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" : m.points >= 40 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"}`}
                    >
                      {m.points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center pt-6 text-xs text-gray-400 dark:text-gray-600">
        Analysis generated on {new Date().toLocaleDateString()} · Data source:
        SEC EDGAR · Model: pro_score_v2
      </div>
    </div>
  );
}
