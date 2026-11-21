"use client";

import { useEffect, useState, use } from "react";
import { getCompanyNews } from "../../../../lib/api";

export default function NewsPage({ params }) {
  const unwrappedParams = use(params);
  const ticker = unwrappedParams.ticker.toUpperCase();
  
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState("7d"); // Default to 7 days

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      setCurrentPage(1); // Reset page on timeframe change
      try {
        const res = await getCompanyNews(ticker, timeframe);
        setNews(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticker, timeframe]);

  const timeTabs = [
    { label: "Live", value: "live", icon: "🔴" },
    { label: "24 Hours", value: "1d" },
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
  ];

  // Helper to generate a consistent color based on the publisher name
  const getPublisherColor = (publisher) => {
    const colors = [
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    ];
    let hash = 0;
    for (let i = 0; i < publisher.length; i++) {
      hash = publisher.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = news.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(news.length / itemsPerPage);

  return (
    <div className="space-y-6">
      
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-[#094cb9]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
          Latest News
        </h2>
        
        <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
          {timeTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTimeframe(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                timeframe === tab.value
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.icon && <span className="text-xs">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#094cb9]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-lg">{error}</div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No news found for {ticker} in this timeframe.
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-500">
          {currentItems.map((article, index) => (
            <a 
              key={index} 
              href={article.link} 
              target="_blank" 
              rel="noreferrer"
              className="relative block bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
            >
              {/* Left Hover Accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#094cb9] opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="flex flex-col sm:flex-row items-start gap-5">
                
                {/* Placeholder Image (Gradient) */}
                             {/* Real Image via Picsum (Seeded by Title) */}
                <div className="hidden sm:block flex-shrink-0 w-28 h-24 rounded-xl overflow-hidden relative border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shadow-sm">
                  <img 
                    src={`https://picsum.photos/seed/${encodeURIComponent(article.title)}/200/150`} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Overlay Gradient for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>

                {/* Content */}
                               {/* Content */}
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#094cb9] dark:group-hover:text-[#0a58d6] transition-colors leading-snug mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                      {article.description || "Read the latest updates and market analysis regarding this company."}
                    </p>
                  </div>
                  
                  {/* Meta Data Row */}
                  <div className="flex flex-wrap items-center gap-3 text-sm mt-auto">
                    <span className={`font-semibold px-2.5 py-1 rounded-md text-xs uppercase tracking-wider ${getPublisherColor(article.publisher)}`}>
                      {article.publisher}
                    </span>
                    
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-xs">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {article.published}
                    </span>

                    

                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-xs border-l border-gray-300 dark:border-gray-700 pl-3">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      Stock News
                    </span>
                  </div>
                </div>
                
                {/* External Link Icon */}
                <div className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors mt-1 hidden sm:block">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && news.length > 0 && (
        <div className="flex items-center justify-between px-2 pt-4">
          <span className="text-sm text-gray-500 font-medium">
            Showing <span className="text-blue-600 font-bold">{indexOfFirstItem + 1}</span> to <span className="text-blue-600 font-bold">{Math.min(indexOfLastItem, news.length)}</span> of <span className="font-bold">{news.length}</span> articles
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-all flex items-center gap-2 shadow-sm"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}