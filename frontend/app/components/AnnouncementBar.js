"use client";

export default function AnnouncementBar() {
  const features = [
    { text: "SEC Filing Data" },
    { text: "Annual & Quarterly Financials" },
    { text: "Pro Score" },
    { text: "Peer Comparisons" },
    { text: "Cash Flow Analysis" },
    { text: "Financial Ratios" },
    { text: "Plain-Language Summaries" },
    { text: "Company Watchlists" },
  ];

  const marqueeItems = [...features, ...features];

  return (
    <div className="w-full relative overflow-hidden z-10 transition-colors duration-300">
      
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-[#0a0a0a] dark:via-gray-900 dark:to-[#0a0a0a]"></div>
      
      {/* Top and bottom borders */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent"></div>

      {/* Scrolling track with edge fades */}
      <div className="relative py-4 mask-fade-edges">
        <div className="flex whitespace-nowrap animate-marquee-reverse">
          {marqueeItems.map((item, index) => (
            <div key={index} className="flex items-center mx-2">
              
              {/* Simple Pill */}
              <div className="flex items-center gap-2.5 px-4 py-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-500 rounded-full shadow-sm hover:shadow-md transition-all duration-300 cursor-default">
                
                {/* Simple Check Icon */}
                <svg 
                  className="w-3.5 h-3.5 text-[#00296b] dark:text-gray-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                
                {/* Text */}
                <span className="text-sm font-semibold text-[#00296b] dark:text-gray-200 tracking-tight">
                  {item.text}
                </span>
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}