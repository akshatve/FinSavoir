"use client";

import { motion } from "framer-motion";

export default function AboutHero() {
  const stats = [
    { value: "112+", label: "Companies tracked" },
    { value: "50K+", label: "SEC filings indexed" },
    { value: "10K+", label: "Active researchers" },
    { value: "5", label: "Years of data" },
  ];

  return (
    <section className="relative w-full py-8 lg:py-12 bg-white dark:bg-[#050505] overflow-hidden border-b border-gray-200 dark:border-gray-800">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/15 via-blue-100/5 to-transparent dark:from-blue-600/15 dark:via-transparent dark:to-transparent blur-3xl opacity-80" />
        {/* <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px]" /> */}
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Top Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800/50 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold text-[#094cb9] dark:text-[#0752ca] uppercase tracking-widest">
              About FinSavoir
            </span>
          </div>

          {/* Huge Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-[65px] font-black text-gray-900 dark:text-white tracking-tighter leading-[0.95] mb-8">
            Research without <br />
            <span className="text-transparent bg-clip-text bg-[#094cb9]">
              the guesswork.
            </span>
          </h1>

          <p className="text-xl md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto mb-16">
            FinSavoir helps you understand public companies through their SEC filings. Explore financial performance, compare businesses, and trace every figure back to its source document.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10"
              >
                <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-[#094cb9]">
                  {stat.value}
                </p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}