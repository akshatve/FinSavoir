"use client";

import { useState, useEffect } from "react";

export default function CompanyLogo({ ticker, name, size = "w-12 h-12" }) {
  const [imgError, setImgError] = useState(false);
  
  // Guard against undefined ticker
  const safeTicker = ticker || "?";

  useEffect(() => {
    setImgError(false);
  }, [safeTicker]);

  // Fallback to the first letter of the ticker
  if (imgError || safeTicker === "?") {
    return (
      <div className={`${size} rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white/20`}>
        {safeTicker.charAt(0).toUpperCase()}
      </div>
    );
  }

  const logoUrl = `https://financialmodelingprep.com/image-stock/${safeTicker}.png`;

  return (
    <img
      src={logoUrl}
      alt={`${name || safeTicker} logo`}
      className={`${size} rounded-xl object-contain bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1.5 shadow-sm`}
      onError={() => setImgError(true)}
    />
  );
}