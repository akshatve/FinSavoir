"use client";

import { createContext, useContext, useState, useEffect } from "react";

const RecentlyViewedContext = createContext();

export function RecentlyViewedProvider({ children }) {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("finsavoir_recently_viewed");
      if (saved) setRecentlyViewed(JSON.parse(saved));
    } catch (err) {
      console.error("Failed to load recently viewed:", err);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(
        "finsavoir_recently_viewed",
        JSON.stringify(recentlyViewed)
      );
    } catch (err) {
      console.error("Failed to save recently viewed:", err);
    }
  }, [recentlyViewed, mounted]);

  const addToRecentlyViewed = (stock) => {
    // stock = { ticker, name, price, change_pct }
    setRecentlyViewed((prev) => {
      // Remove duplicate if already exists
      const filtered = prev.filter((s) => s.ticker !== stock.ticker);
      // Add to front, limit to 5
      return [{ ...stock, viewedAt: Date.now() }, ...filtered].slice(0, 5);
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
  };

  return (
    <RecentlyViewedContext.Provider
      value={{ recentlyViewed, addToRecentlyViewed, clearRecentlyViewed }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider");
  return ctx;
}