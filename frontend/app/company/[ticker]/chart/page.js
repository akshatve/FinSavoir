"use client";

import { useEffect, useRef, use } from "react";
import { useTheme } from "next-themes";

export default function ChartPage({ params }) {
  const unwrappedParams = use(params);
  const ticker = unwrappedParams.ticker.toUpperCase();
  const containerRef = useRef(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear the container to prevent double charts
    containerRef.current.innerHTML = "";

    // Create the widget container
    const widgetContainer = document.createElement("div");
    widgetContainer.id = "tradingview_widget";
    widgetContainer.className = "tradingview-widget-container__widget";
    containerRef.current.appendChild(widgetContainer);

    // Inject the TradingView script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    script.innerHTML = JSON.stringify({
      autosize: false,            // <-- TURN OFF AUTOSIZE
      width: "100%",              // <-- TAKE FULL WIDTH
      height: 600,                // <-- FORCE 800PX HEIGHT
      symbol: ticker,
      interval: "D",
      timezone: "Etc/UTC",
      theme: resolvedTheme === "dark" ? "dark" : "light",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      hide_side_toolbar: false,
      withdateranges: true,
      details: true,
      hotlist: false,
      studies: [
        "STD;Volume@tv-basicstudies"
      ],
      support_host: "https://www.tradingview.com"
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [ticker, resolvedTheme]);

  return (
    <div className="space-y-6">
      
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        
        {/* 
          We remove the h-[600px] from here because the script handles the height now.
          We just need to make sure the container is relative so the widget fills it.
        */}
        <div 
          ref={containerRef} 
          className="tradingview-widget-container w-full relative"
        >
        </div>

        {/* <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <span>Data and display by TradingView (delayed where marked).</span>
          <a 
            href={`https://www.tradingview.com/symbols/${ticker}/`} 
            target="_blank" 
            rel="noreferrer"
            className="text-blue-500 hover:underline"
          >
            View full chart on TradingView
          </a>
        </div> */}
      </div>

      {/* <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Professional candlestick charts, technical indicators, and drawing tools powered by TradingView.
      </p> */}

    </div>
  );
}