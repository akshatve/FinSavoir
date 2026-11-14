"use client";

import { getTrendingVideos } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";

export default function TrendingVideos() {
  // 60 minutes TTL for Videos
  const { data: videos, loading } = useCachedData(
    "trending_videos_cache", 
    getTrendingVideos, 
    60 
  );

  const timeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 animate-pulse">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8 mx-auto"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[500px] bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) return null;

  const activeVideo = videos[0];

  
  return (
    <section className="relative w-full py-12 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 overflow-hidden border-t border-gray-200 dark:border-gray-800">
      {/* Subtle Background Glow */}
      {/* <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-red-500/5 dark:bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div> */}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold mb-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              MARKET MEDIA
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Trending Videos
            </h2>
          </div>
        </div>

        {/* Cinema Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* MAIN FEATURED VIDEO (Takes up 2 columns) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-black group">
              {/* YouTube Iframe */}
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=0&rel=0`}
                title={activeVideo.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Video Info */}
            <div className="px-2">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {activeVideo.title}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-red-600 dark:text-red-500">
                  {activeVideo.channel} {/* <-- FIXED: Using activeVideo */}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                <span>{timeAgo(activeVideo.published)}</span>
              </div>
            </div>
          </div>

          {/* PLAYLIST SIDEBAR (Takes up 1 column) */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Up Next
            </h4>
            {videos
              .filter((v) => v.id !== activeVideo.id)
              .slice(0, 4)
              .map((video) => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className="flex gap-3 p-2 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-700 hover:shadow-md transition-all text-left group"
                >
                  {/* Thumbnail */}
                  <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-black">
                    <img
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                      <svg
                        className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    {/* Duration Badge (Optional: If API doesn't return duration, we can show time ago instead) */}
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-bold text-white">
                      {timeAgo(video.published)}
                    </div>
                  </div>

                  {/* Text Info */}
                  <div className="flex flex-col justify-center">
                    <h5 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {video.title}
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {video.channel}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}