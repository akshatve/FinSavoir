"use client";

import { createContext, useContext, useState, useEffect } from "react";

const WatchlistContext = createContext();

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("finsavoir_watchlist");
      if (saved) {
        setWatchlist(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Failed to load watchlist:", err);
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("finsavoir_watchlist", JSON.stringify(watchlist));
    } catch (err) {
      console.error("Failed to save watchlist:", err);
    }
  }, [watchlist, mounted]);

  const addToWatchlist = (stock) => {
    // stock = { ticker, name, price, change_pct }
    setWatchlist((prev) => {
      if (prev.find((s) => s.ticker === stock.ticker)) return prev;
      return [...prev, { ...stock, addedAt: Date.now() }];
    });
  };

  const removeFromWatchlist = (ticker) => {
    setWatchlist((prev) => prev.filter((s) => s.ticker !== ticker));
  };

  const isInWatchlist = (ticker) => {
    return watchlist.some((s) => s.ticker === ticker);
  };

  const toggleWatchlist = (stock) => {
    if (isInWatchlist(stock.ticker)) {
      removeFromWatchlist(stock.ticker);
    } else {
      addToWatchlist(stock);
    }
  };

  const openWatchlist = () => setIsOpen(true);
  const closeWatchlist = () => setIsOpen(false);

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        isOpen,
        openWatchlist,
        closeWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used within WatchlistProvider");
  return ctx;
}