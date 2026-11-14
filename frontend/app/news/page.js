"use client";

import { useState, useEffect } from "react";
import { getAllNews } from "../../lib/api";
import { motion } from "framer-motion";

export default function NewsPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [newsData, setNewsData] = useState({
    articles: [],
    total_pages: 1,
    total_articles: 0,
  });
  const [loading, setLoading] = useState(true);

  const categories = [
    "All",
    "Market",
    "Technology",
    "Finance",
    "Energy",
    "Healthcare",
  ];
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch news when page, category, or query changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllNews(
          currentPage,
          10,
          category,
          debouncedQuery,
        );
        setNewsData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, category, debouncedQuery]);

  const getImage = (title) =>
    `https://picsum.photos/seed/${encodeURIComponent(title)}/800/400`;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= newsData.total_pages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Live Feed
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            Market News
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            The latest headlines from the US stock market.
          </p>
        </div>

        {/* Controls: Categories + Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 bg-white dark:bg-[#111] p-1 rounded-xl border border-gray-200 dark:border-gray-800 w-fit">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  category === cat
                    ? "bg-[#094cb9] text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all news..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 dark:bg-gray-900 rounded-3xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : newsData.articles.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No articles found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsData.articles.map((article, index) => (
              <motion.a
                key={index}
                href={article.link}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white dark:bg-[#111] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getImage(article.title)}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md text-xs font-bold rounded-md text-gray-900 dark:text-white uppercase tracking-wider">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#094cb9] dark:text-[#094cb9] uppercase tracking-wider mb-2">
                    <span>{article.publisher}</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-3 line-clamp-2 group-hover:text-[#094cb9] transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-auto">
                    {article.description}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        )}

        {/* Pagination */}
        {newsData.total_pages > 0 && (
          <div className="mt-12 flex items-center justify-between bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-4">
            <span className="text-sm text-gray-500 font-medium">
              Page{" "}
              <span className="text-[#094cb9] font-bold">
                {newsData.current_page}
              </span>{" "}
              of <span className="font-bold">{newsData.total_pages}</span>
              <span className="ml-2 text-gray-400">
                ({newsData.total_articles} articles)
              </span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 text-sm font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === newsData.total_pages || loading}
                className="px-4 py-2 text-sm font-bold bg-[#094cb9] text-white rounded-lg hover:bg-[#094cb9] disabled:opacity-40 transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
