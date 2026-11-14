"use client";

import { motion } from "framer-motion";

export default function AboutHowItHelps() {
  const items = [
    {
      title: "Finding the same line in filing after filing",
      desc: "Income statement, balance sheet and cash flow are laid out by period in one report, so a figure sits beside its history.",
      gradient: "from-[#094cb9] to-[#094cb9]",
      bgGradient: "from-white to-white dark:from-blue-900/20 dark:to-cyan-900/20",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      span: "md:col-span-2",
    },
    {
      title: "Moving between years, quarters and TTM",
      desc: "Annual, quarterly and trailing-twelve-month views switch in one place, with each period labelled.",
      gradient: "from-[#094cb9] to-[#094cb9]",
      bgGradient: "from-white to-white dark:from-indigo-900/20 dark:to-purple-900/20",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      span: "md:col-span-1",
    },
    {
      title: "Lining companies up side by side",
      desc: "The peer comparison places a selected metric next to similar companies, showing each one's reporting period and units.",
      gradient: "from-[#094cb9] to-[#094cb9]",
      bgGradient: "from-white to-white dark:from-purple-900/20 dark:to-pink-900/20",
      icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
      span: "md:col-span-1",
    },
    {
      title: "Tracking down where a number came from",
      desc: "Supported reported figures open the filing they came from, with the period and the reported item.",
      gradient: "from-[#094cb9] to-[#094cb9]",
      bgGradient: "from-white to-white dark:from-emerald-900/20 dark:to-teal-900/20",
      icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
      span: "md:col-span-2",
    },
  ];

  return (
    <section className="w-full py-12 bg-gray-50 dark:bg-[#050505] border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold text-[#094cb9] uppercase tracking-widest">How it helps</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mt-3 mb-6">
            Less time gathering. <br />
            <span className="text-transparent bg-clip-text bg-[#094cb9]">
              More time understanding.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`${item.span} group relative p-8 rounded-3xl bg-gradient-to-br ${item.bgGradient} border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Top gradient bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient}`}></div>

              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">{item.title}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}