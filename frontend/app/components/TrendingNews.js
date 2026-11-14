"use client";

import Link from "next/link";
import { getTrendingNews } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";
import { motion } from "framer-motion";

export default function TrendingNews() {
  // 15 minutes TTL for News
  const { data: rawNews, loading } = useCachedData(
    "trending_news_cache", 
    getTrendingNews, 
    15 
  );

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-20 animate-pulse space-y-8">
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
        <div className="grid grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>)}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }

  if (!rawNews || rawNews.length === 0) return null;

  // Ensure we have at least 13 unique items (5 + 3 + 5)
  const news = rawNews.length >= 13 ? rawNews : [...rawNews, ...rawNews].slice(0, 15);

  const getImage = (title) => `https://picsum.photos/seed/${encodeURIComponent(title)}/600/400`;

  // Slice the data for the 3 rows (0-4, 5-7, 8-12)
  const topRow = news.slice(0, 5);
  const middleRow = news.slice(5, 8);
  const bottomRow = news.slice(8, 13);
  
  const trendingTickers = ["AAPL", "NVDA", "TSLA", "MSFT", "AMZN", "GOOGL"];

  return (
    <section className="relative w-full py-12 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 overflow-hidden border-t border-gray-200 dark:border-gray-800">
      
      <div className="max-w-[1400px] mx-auto px-6 relative z-10 mb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-blue-900/30 text-green-600 dark:text-green-400 text-sm font-bold mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              LIVE MARKET NEWS
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Latest Headlines
            </h2>
          </div>
          <Link href="/news" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group">
            View All News
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* ROW 1: 5 Articles scrolling Left-to-Right */}
        <div className="w-full overflow-hidden mask-fade-edges py-2">
          <div className="flex animate-marquee gap-4 hover:[animation-play-state:paused]">
            {[...topRow, ...topRow].map((article, i) => (
              <Link key={`top-${i}`} href={article.link} target="_blank" rel="noreferrer" className="min-w-[300px] flex flex-col bg-gray-50 dark:bg-[#111] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-blue-400 transition-all group shadow-sm hover:shadow-lg">
                <div className="relative h-40 overflow-hidden">
                  <img src={getImage(article.title)} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                    {article.publisher}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-auto">
                    {article.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ROW 2: 3 Large Articles (Static) */}
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {middleRow.map((article, i) => (
            <motion.div key={`mid-${i}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Link href={article.link} target="_blank" rel="noreferrer" className="flex flex-col h-full bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-blue-400 transition-all group shadow-md">
                <div className="relative h-56 overflow-hidden">
                  <img src={getImage(article.title)} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {article.publisher}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-auto">
                    {article.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ROW 3: 5 Articles scrolling Right-to-Left */}
        <div className="w-full overflow-hidden mask-fade-edges py-2">
          <div className="flex animate-marquee-reverse gap-4 hover:[animation-play-state:paused]">
            {[...bottomRow, ...bottomRow].map((article, i) => (
              <Link key={`bot-${i}`} href={article.link} target="_blank" rel="noreferrer" className="min-w-[300px] flex flex-col bg-gray-50 dark:bg-[#111] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-blue-400 transition-all group shadow-sm hover:shadow-lg">
                <div className="relative h-40 overflow-hidden">
                  <img src={getImage(article.title)} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                    {article.publisher}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-auto">
                    {article.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* TRENDING TICKERS */}
      <div className="max-w-[1400px] mx-auto px-6 relative z-10 mt-10 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mr-2 uppercase tracking-wider">Trending Tickers:</span>
        {trendingTickers.map((ticker) => (
          <Link
            key={ticker}
            href={`/company/${ticker}`}
            className="px-4 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
          >
            ${ticker}
          </Link>
        ))}
      </div>

    </section>
  );
}