"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function FourSteps() {
  const steps = [
    {
      number: "01",
      title: "Find a company",
      description:
        "Search by company name or stock symbol to begin your research. Open its available financial report and explore the statements, trends, and reporting periods in one place. Start with a business you follow.",
      cta: "Search a company",
      link: "/search",
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    },
    {
      number: "02",
      title: "Understand its finances",
      description:
        "Explore how much revenue the company earns, the profit it generates, and how its operations turn into cash. Review its debt and financial ratios across annual, quarterly, and TTM periods.",
      cta: "Explore companies",
      link: "/companies",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      number: "03",
      title: "Compare peers",
      description:
        "Place companies side by side to examine differences in growth, profitability, cash generation, and debt. Compare metrics while keeping company size and reporting dates in view.",
      cta: "Choose a company",
      link: "/compare",
      icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
    },
    {
      number: "04",
      title: "Check the source",
      description:
        "Trace supported figures back to the original filing. For calculated measures, review the formula and inputs. Distinguish reported facts from calculations and estimates.",
      cta: "How sources work",
      link: "/about/sources",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0a0a0a] relative overflow-hidden transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4 px-4 py-1.5 rounded-full bg-[#00296b]/5 dark:bg-gray-800/60 border border-[#00296b]/15 dark:border-gray-700/60"
          >
            <span className="text-sm font-bold text-[#00296b] dark:text-gray-300 uppercase tracking-wider">The Workflow</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black mb-6 text-gray-900 dark:text-white tracking-tight"
          >
            How to research a company <br className="hidden md:block" />
            <span className="text-[#00296b] dark:text-[#094cb9]">
              in four steps
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            A repeatable process to get from a ticker symbol to a deep understanding of the business.
          </motion.p>
        </div>

        {/* 4-Column Row Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
          
          {/* Connector Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-[60px] left-8 right-8 h-px bg-gradient-to-r from-[#00296b]/10 via-[#00296b]/25 to-[#00296b]/10 dark:from-gray-700/20 dark:via-gray-600/40 dark:to-gray-700/20 z-0"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative group h-full z-10"
            >
              {/* Card Container */}
              <div className="h-full relative bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col hover:-translate-y-2">
                
                {/* Top Bar (Always Visible) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#00296b] dark:bg-gray-200"></div>

                {/* Step Number & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#00296b]/5 dark:bg-gray-800/60 flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#00296b] dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={step.icon} />
                    </svg>
                  </div>
                  <span className="text-4xl font-black text-[#00296b] dark:text-gray-200 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-[#094cb9]">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                    {step.description}
                  </p>

                  {/* Call to Action Link */}
                  <Link
                    href={step.link}
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#00296b] dark:text-gray-200 hover:text-[#003d9e] dark:hover:text-white transition-colors mt-auto group/link"
                  >
                    {step.cta}
                    <svg
                      className="w-4 h-4 transition-transform group-hover/link:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}