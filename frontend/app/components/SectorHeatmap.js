"use client";

import { useCachedData } from "../../lib/useCachedData";
import { getSectorFundamentals } from "../../lib/api";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SectorHeatmap() {
  const { data: sectors, loading } = useCachedData(
    "sector_fundamentals_cache",
    getSectorFundamentals,
    30
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl md:rounded-3xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
        <div className="w-full h-[300px] md:h-[400px] bg-gray-100 dark:bg-gray-900 rounded-xl md:rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (!sectors) return null;

  const sortedSectors = [...sectors].sort(
    (a, b) => b.median_revenue_growth - a.median_revenue_growth
  );

  // Responsive grid spans:
  // - Mobile: uniform 2-col grid (no mega cell)
  // - md: 4-col grid, first item spans 2 cols on 1 row
  // - lg: 4-col grid, first item spans 2x2 (desktop look)
  const getGridClass = (index) => {
    if (index === 0) {
      return "col-span-1 row-span-1 md:col-span-2 md:row-span-1 lg:row-span-2";
    }
    if (index === 1) {
      return "col-span-1 row-span-1 md:col-span-2 md:row-span-1";
    }
    return "col-span-1 row-span-1";
  };

  const getBackgroundClass = (growth) => {
    if (growth > 15) return "bg-emerald-500 hover:bg-emerald-600 text-white";
    if (growth > 8) return "bg-emerald-400 hover:bg-emerald-500 text-white";
    if (growth > 3) return "bg-emerald-300 hover:bg-emerald-400 text-emerald-900";
    if (growth > 0) return "bg-emerald-200 hover:bg-emerald-300 text-emerald-900";
    if (growth > -3) return "bg-gray-300 hover:bg-gray-400 text-gray-900";
    if (growth > -8) return "bg-red-200 hover:bg-red-300 text-red-900";
    if (growth > -15) return "bg-red-400 hover:bg-red-500 text-white";
    return "bg-red-500 hover:bg-red-600 text-white";
  };

  // Responsive type sizing helper — keeps the mega cell text bigger on desktop
  const getTitleClass = (index) => {
    if (index === 0) {
      return "text-sm sm:text-base md:text-xl lg:text-2xl font-black tracking-tight leading-tight";
    }
    if (index === 1) {
      return "text-sm sm:text-base md:text-lg lg:text-xl font-black tracking-tight leading-tight";
    }
    return "text-sm sm:text-base md:text-lg font-black tracking-tight leading-tight";
  };

  const getGrowthClass = (index) => {
    if (index === 0) {
      return "text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-none";
    }
    return "text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tighter leading-none";
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl md:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 md:px-8 py-4 md:py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Sector Fundamentals
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm">
            Median revenue growth and operating margin. Click any sector to explore.
          </p>
        </div>

        {/* Legend — smaller on mobile, hidden on very small screens */}
        <div className="hidden xs:flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">
          <span className="text-red-500">-15%</span>
          <div className="flex rounded-sm overflow-hidden">
            <div className="w-3 sm:w-5 h-2.5 sm:h-3 bg-red-500"></div>
            <div className="w-3 sm:w-5 h-2.5 sm:h-3 bg-red-400"></div>
            <div className="w-3 sm:w-5 h-2.5 sm:h-3 bg-red-200"></div>
            <div className="w-3 sm:w-5 h-2.5 sm:h-3 bg-gray-300 dark:bg-gray-700"></div>
            <div className="w-3 sm:w-5 h-2.5 sm:h-3 bg-emerald-200"></div>
            <div className="w-3 sm:w-5 h-2.5 sm:h-3 bg-emerald-400"></div>
            <div className="w-3 sm:w-5 h-2.5 sm:h-3 bg-emerald-500"></div>
          </div>
          <span className="text-emerald-500">+15%</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[110px] sm:auto-rows-[125px] md:auto-rows-[150px] gap-2 md:gap-2">
          {sortedSectors.map((sector, index) => (
            <motion.div
              key={sector.sector}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={getGridClass(index)}
            >
              <Link
                href={`/sectors#${sector.sector
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")}`}
                className={`relative flex flex-col justify-between p-3 sm:p-4 md:p-5 rounded-xl transition-all duration-300 group overflow-hidden w-full h-full ${getBackgroundClass(
                  sector.median_revenue_growth
                )}`}
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-50"></div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="min-w-0">
                    <h3 className={getTitleClass(index)}>{sector.sector}</h3>
                    <p className="text-[9px] sm:text-[10px] md:text-xs font-bold opacity-70 mt-1 uppercase tracking-wider">
                      {sector.company_count} companies
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-1">
                    <div className="min-w-0">
                      <p className={getGrowthClass(index)}>
                        {sector.median_revenue_growth > 0 ? "+" : ""}
                        {sector.median_revenue_growth}%
                      </p>
                      <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest opacity-70 mt-1">
                        Rev Growth
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-base md:text-xl font-bold leading-none">
                        {sector.median_operating_margin}%
                      </p>
                      <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest opacity-70 mt-1">
                        Op Margin
                      </p>
                    </div>
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-3.5 h-3.5 md:w-4 md:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
        <p>Calculated from latest reported figures. Not investment advice.</p>
        <p className="font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live
        </p>
      </div>
    </div>
  );
}