"use client";

import React, { use } from "react";
import Link from "next/link";

export default function MethodologyPage({ params }) {
  const unwrappedParams = use(params);
  const ticker = unwrappedParams.ticker.toUpperCase();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      
      {/* HERO SECTION */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link
            href={`/company/${ticker}/pro-score`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#094cb9] dark:text-[#0c56ce] hover:text-[#0a54cc]   dark:hover:text-[#094cb9] transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Pro Score
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
              Methodology
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Version pro_score_v1
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white max-w-3xl leading-tight">
            How we build the Pro Score
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-4 max-w-2xl leading-relaxed">
            A transparent, rule-based system that places a company's reported figures on two 0–100 scales. Every input, anchor, weight and rule is published below.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            Last updated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* MAIN CONTENT WITH SIDEBAR */}
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* STICKY SIDEBAR NAVIGATION */}
        <aside className="lg:w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-3 px-3">
              On this page
            </p>
            {[
              { id: "intro", label: "Overview" },
              { id: "scores", label: "The two scores" },
              { id: "calculation", label: "How a score is calculated" },
              { id: "edge-cases", label: "Missing data & edge cases" },
              { id: "quality-table", label: "Financial Quality details" },
              { id: "risk-table", label: "Business Risk details" },
              { id: "interpretation", label: "Interpretation rules" },
              { id: "limitations", label: "Limitations" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </aside>

        {/* MAIN PROSE */}
        <div className="flex-1 max-w-3xl space-y-16">
          
          {/* INTRO */}
          <section id="intro" className="space-y-4">
            <div className="bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-blue-500 rounded-r-xl p-6">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Read this first
              </h3>
              <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                The Pro Score is a descriptive assessment, not a forecast. A score of 80/100 does not mean an 80% chance of profit or safety. No out-of-sample test has shown that these scores predict returns, defaults or future results.
              </p>
            </div>

            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              FinSavoir's Pro Score places a company's reported financial numbers on two 0–100 scales — <strong>Financial Quality</strong> and <strong>Business & Balance-Sheet Risk</strong> — with published rules, showing every input, its source and its contribution.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Note: The Valuation and Overall Stock Risk cards are currently marked Unavailable because FinSavoir does not yet display licensed share prices. They are never replaced with a fundamentals-only substitute.
            </p>
          </section>

          {/* TWO SCORES */}
          <section id="scores" className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Two scores, two questions</h2>
              <p className="text-sm text-gray-500 mt-2">Each score uses a different statistic. No measure appears in both scores.</p>
            </div>

            <div className="grid gap-4">
              <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Financial Quality</h3>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">Higher = Stronger</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  <em className="font-medium text-gray-900 dark:text-gray-200">How strong have the company's fundamentals been?</em> Uses latest-year levels of profitability, cash generation, cash conversion, leverage, debt service, liquidity, and earnings stability.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Business & Balance-Sheet Risk</h3>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">Higher = Safer</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  <em className="font-medium text-gray-900 dark:text-gray-200">How much risk has the company's filings measured?</em> Uses worst-year and downside measures: lowest coverage, deepest revenue fall, earnings drawdown, loss years and cash-burn years.
                </p>
              </div>
            </div>
          </section>

          {/* CALCULATION STEPS */}
          <section id="calculation" className="space-y-6">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">How a score is calculated</h2>
            <div className="space-y-4">
              {[
                { n: "01", title: "Measure", body: "Each input comes from the company's annual (fiscal-year) report, filed with the SEC. Inputs are either reported values or FinSavoir's versioned ratio calculations. Every value links to its filing, XBRL tag and dates." },
                { n: "02", title: "Transform to points", body: "Each measure is mapped linearly onto 0–100 points between two fixed anchors. Values beyond an anchor are capped at 0 or 100. This handles outliers: an extreme value cannot earn more than full points or lose more than zero." },
                { n: "03", title: "Weight", body: "The score is the weighted mean of the points of the measures that have data. Each measure's contribution is its points × its effective weight. The contributions add up to the score." },
                { n: "04", title: "Check minimum data", body: "A score is shown only when the company has at least 3 fiscal years of reported data. Otherwise it reads Insufficient data and names what is missing." },
              ].map((step) => (
                <div key={step.n} className="flex gap-5 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#094cb9] to-[#094cb9] text-white font-black flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition-transform">
                    {step.n}
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* EDGE CASES */}
          <section id="edge-cases" className="space-y-4">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Missing data & edge cases</h2>
            <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-6">
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                {[
                  "A missing input is excluded, never counted as zero. The remaining weights are scaled up.",
                  "Ratios that divide by earnings are not calculated when net income is not positive.",
                  "Negative equity scores the highest risk on the leverage measure, and the reason is shown.",
                  "Non-positive operating cash flow means debt payback scores 0 points. No negative number of years is shown.",
                  "Stability measures need at least 4 fiscal years; worst-year and count measures need 3.",
                  "Every scored measure is a ratio or a count within one company's own statements, so reporting currency cannot distort it.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* QUALITY TABLE */}
          <section id="quality-table" className="space-y-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Financial Quality measures</h2>
              <p className="text-sm text-gray-500 mt-2">Model: General (industrial and service companies). Weighted total = 100%.</p>
            </div>
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-bold">Measure</th>
                    <th className="px-4 py-3 font-bold">Input</th>
                    <th className="px-4 py-3 font-bold text-center">0 pts</th>
                    <th className="px-4 py-3 font-bold text-center">100 pts</th>
                    <th className="px-4 py-3 font-bold text-right">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                  {[
                    ["Operating margin", "operating income ÷ revenue", "0.0%", "30%", "15%"],
                    ["Return on assets", "net income ÷ average total assets", "0.0%", "15%", "10%"],
                    ["Free cash flow margin", "(operating cash flow − capex) ÷ revenue", "−5.0%", "20%", "10%"],
                    ["Cash conversion", "free cash flow ÷ net income", "30%", "110%", "10%"],
                    ["Debt ÷ operating cash flow", "total debt ÷ operating cash flow", "5.0 years", "0.0 years", "15%"],
                    ["Interest coverage", "operating income ÷ interest expense", "1.5×", "15.0×", "15%"],
                    ["Current ratio", "current assets ÷ current liabilities", "0.8×", "2.0×", "10%"],
                    ["Operating-margin stability", "std dev. of op. margin (min 4 yrs)", "12%", "1.0%", "10%"],
                    ["Profitable years", "years with net income > 0", "50%", "100%", "5%"],
                  ].map(([m, i, a, b, w]) => (
                    <tr key={m} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{m}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{i}</td>
                      <td className="px-4 py-3 text-center tabular-nums font-medium">{a}</td>
                      <td className="px-4 py-3 text-center tabular-nums font-medium">{b}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold text-blue-600 dark:text-blue-400">{w}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* RISK TABLE */}
          <section id="risk-table" className="space-y-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Business Risk measures</h2>
              <p className="text-sm text-gray-500 mt-2">Points here mean more risk. The 100-point anchor is the riskiest end.</p>
            </div>
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-bold">Measure</th>
                    <th className="px-4 py-3 font-bold">Input</th>
                    <th className="px-4 py-3 font-bold text-center">0 pts</th>
                    <th className="px-4 py-3 font-bold text-center">100 pts (riskiest)</th>
                    <th className="px-4 py-3 font-bold text-right">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                  {[
                    ["Liabilities ÷ assets", "total liabilities ÷ total assets", "40%", "90%", "20%"],
                    ["Weakest interest coverage", "lowest over last 5 years", "10.0×", "1.0×", "20%"],
                    ["Worst revenue decline", "lowest YoY growth (up to 8 years)", "0.0%", "−30%", "15%"],
                    ["Loss years", "years with net income < 0", "0", "3", "15%"],
                    ["Negative free-cash-flow years", "share of last 5 years with FCF < 0", "0%", "60%", "15%"],
                    ["Deepest earnings drawdown", "largest fall from prior peak", "0.0%", "−80%", "10%"],
                    ["Share dilution", "change in diluted shares", "0.0%", "10%", "5%"],
                  ].map(([m, i, a, b, w]) => (
                    <tr key={m} className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{m}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{i}</td>
                      <td className="px-4 py-3 text-center tabular-nums font-medium">{a}</td>
                      <td className="px-4 py-3 text-center tabular-nums font-medium">{b}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold text-red-600 dark:text-red-400">{w}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* INTERPRETATION */}
          <section id="interpretation" className="space-y-4">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">How the interpretation is written</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">The sentences below the scores are generated by fixed rules, not written by an analyst.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm mb-2">Supports</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Lists quality measures scoring 70 or more.</p>
              </div>
              <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
                <h4 className="font-bold text-red-800 dark:text-red-400 text-sm mb-2">Increases Risk</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Lists quality measures scoring 40 or less and risk measures scoring 50 or more.</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>· Financial Quality is described as <strong>strong</strong> (70+), <strong>mixed</strong> (45–69) or <strong>weak</strong> (below 45).</li>
              <li>· Business risk is described as <strong>elevated</strong> (60+), <strong>moderate</strong> (35–59) or <strong>low</strong> (below 35).</li>
              <li>· It never recommends buying, selling or holding.</li>
            </ul>
          </section>

          {/* LIMITATIONS */}
          <section id="limitations" className="space-y-4">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Limitations</h2>
            <div className="border-l-4 border-gray-300 dark:border-gray-700 pl-5 space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p>Model-generated and descriptive: no out-of-sample test has shown that these scores predict returns, defaults or future results.</p>
              <p>Anchors and weights are judgement-based, not fitted to outcomes.</p>
              <p>Annual data only; a quarter's change appears after the next annual report.</p>
              <p>Reported figures are taken as filed; accounting choices and one-off items are not adjusted.</p>
              <p>Valuation and Overall Stock Risk are shown only when current share-price data is available.</p>
            </div>
          </section>

          {/* FOOTER */}
          <div className="pt-12 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-500 space-y-2">
            <p className="font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">Document Info</p>
            <p>Version pro_score_v1 · Data source: SEC EDGAR XBRL filings</p>
            <p>FinSavoir does not provide investment advice. All scores are descriptive assessments of reported figures.</p>
          </div>

        </div>
      </div>
    </div>
  );
}