"use client";

import FadeIn from "./FadeIn";

export default function Features() {
  const features = [
    { 
      title: "SEC Filing Data", 
      desc: "Recent 10-K, 10-Q and 8-K filings for each company, linked to the original on SEC.gov.",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      leftColor: "border-l-[#094cb9] dark:border-l-[#094cb9]",
    },
    { 
      title: "Annual & Quarterly", 
      desc: "Income statement, balance sheet and cash flow across annual and quarterly periods.",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      leftColor: "border-l-[#094cb9] dark:border-l-[#094cb9]",
    },
    { 
      title: "Pro Score", 
      desc: "Two rule-based 0–100 scores built from SEC annual filings, with every input shown.",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      leftColor: "border-l-[#094cb9] dark:border-l-[#094cb9]",
    },
    { 
      title: "Peer Comparisons", 
      desc: "Line up two companies and examine differences in size, valuation and profitability.",
      icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-900/20",
      leftColor: "border-l-[#094cb9] dark:border-l-[#094cb9]",
    },
    { 
      title: "Plain-Language Summary", 
      desc: "A template-written overview of the latest annual figures reported to the SEC.",
      icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      leftColor: "border-l-[#094cb9] dark:border-l-[#094cb9]",
    },
    { 
      title: "Financial Ratios", 
      desc: "Valuation, profitability and balance-sheet ratios. Pro Score inputs come with their formulas.",
      icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      leftColor: "border-l-[#094cb9] dark:border-l-[#094cb9]",
    },
  ];

  return (
    <section className="py-12 bg-gray-50 dark:bg-[#050505] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <FadeIn>
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Platform Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              What FinSavoir <span className="text-[#094cb9]">Covers</span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              A comprehensive toolkit for analyzing public companies through their SEC filings.
            </p>
          </FadeIn>
        </div>

        {/* Clean 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FadeIn key={index} delay={index * 0.05}>
              <div className={`group bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 border-l-4 ${feature.leftColor} shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 h-full`}>
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                  <svg className={`w-6 h-6 ${feature.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}