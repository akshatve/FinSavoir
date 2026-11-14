"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutCoverage() {
  return (
    <section className="relative w-full py-12 bg-white dark:bg-[#0a0a0a] overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-400/10 via-blue-100/5 to-transparent dark:from-blue-600/10 dark:via-transparent dark:to-transparent blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-6">
            Start with a company <br />
            <span className="text-transparent bg-clip-text bg-[#094cb9]">
              you want to understand.
            </span>
          </h2>
        </motion.div>

        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-[#111] dark:to-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 md:p-12 shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#094cb9]"></span>
            What is covered
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
            FinSavoir covers companies that file with the US SEC, including foreign companies with US listings. Companies that file only outside the US are not covered in this release. Reports reflect the filings FinSavoir has retrieved, which can trail a company's newest filing. This is not real-time market data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/stocks"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#094cb9] text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all"
            >
              Explore Companies
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}