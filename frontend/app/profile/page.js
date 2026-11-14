"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getProfile } from "../../lib/api";
import { useWatchlist } from "../../lib/WatchlistContext";
import { useRecentlyViewed } from "../../lib/RecentlyViewedContext";
import CompanyLogo from "../components/CompanyLogo";
import { formatCurrency } from "../../lib/format";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const hasChecked = useRef(false);

  const { watchlist, openWatchlist } = useWatchlist();
  const { recentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        if (err.status === 401 || err.message?.toLowerCase().includes("no token")) {
          localStorage.removeItem("token");
          window.dispatchEvent(new Event("authChanged"));
          router.replace("/login");
        } else {
          setError("Couldn't load your profile. Please refresh the page.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const firstLetter = user.email.charAt(0).toUpperCase();
  const username = user.email.split("@")[0];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Account</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your profile and watchlists.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm h-fit relative overflow-hidden"
        >
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#00296b]"></div>

          {/* Avatar with first letter */}
          <div className="w-15 h-15 rounded-xl bg-[#00296b] flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20">
            <span className="text-4xl font-black text-white">{firstLetter}</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 capitalize">
            {username}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 break-all">
            {user.email}
          </p>

          {/* Stats */}
          <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Status</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Active
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Verified</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Yes</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Member Since</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Watchlist</span>
              <span className="font-semibold text-gray-900 dark:text-white">{watchlist.length}</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Watchlist & Recently Viewed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          
          {/* Watchlist Card */}
          <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#00296b] dark:text-[#043d99]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">My Watchlist</h3>
                <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md">
                  {watchlist.length}
                </span>
              </div>
              <button
                onClick={openWatchlist}
                className="text-sm font-semibold text-[#00296b] dark:text-blue-700 hover:text-blue-700 transition-colors"
              >
                Open →
              </button>
            </div>

            {watchlist.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  You haven't added any stocks yet.
                </p>
                <Link
                  href="/stocks"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Browse Stocks
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {watchlist.slice(0, 5).map((stock) => {
                  const isPositive = (stock.change_pct || 0) >= 0;
                  return (
                    <Link
                      key={stock.ticker}
                      href={`/company/${stock.ticker}`}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
                    >
                      <CompanyLogo ticker={stock.ticker} size="w-9 h-9" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{stock.ticker}</p>
                        <p className="text-xs text-gray-500 truncate">{stock.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {formatCurrency(stock.price || 0)}
                        </p>
                        <p className={`text-xs font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                          {isPositive ? "+" : ""}
                          {(stock.change_pct || 0).toFixed(2)}%
                        </p>
                      </div>
                    </Link>
                  );
                })}
                {watchlist.length > 5 && (
                  <div className="px-6 py-3 text-center">
                    <button
                      onClick={openWatchlist}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + {watchlist.length - 5} more
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recently Viewed Card */}
          <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recently Viewed</h3>
              <span className="text-xs font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md">
                {recentlyViewed.length}
              </span>
            </div>

            {recentlyViewed.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You haven't viewed any companies yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentlyViewed.map((stock) => {
                  const isPositive = (stock.change_pct || 0) >= 0;
                  return (
                    <Link
                      key={stock.ticker}
                      href={`/company/${stock.ticker}`}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <CompanyLogo ticker={stock.ticker} size="w-9 h-9" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{stock.ticker}</p>
                        <p className="text-xs text-gray-500 truncate">{stock.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {formatCurrency(stock.price || 0)}
                        </p>
                        <p className={`text-xs font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                          {isPositive ? "+" : ""}
                          {(stock.change_pct || 0).toFixed(2)}%
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </motion.div>

      </div>
    </div>
  );
}