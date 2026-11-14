"use client";

import { useState, useEffect, useRef } from "react";

export function useCachedData(key, fetchFn, ttlMinutes = 5) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchFreshData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const freshData = await fetchFn();
      setData(freshData);
      
      // Save to cache with a timestamp
      const cachePayload = {
        data: freshData,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(key, JSON.stringify(cachePayload));
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check Cache on mount
    const cached = sessionStorage.getItem(key);
    if (cached) {
      const { data: cachedData, timestamp } = JSON.parse(cached);
      const ageInMinutes = (Date.now() - timestamp) / 1000 / 60;

      // If cache is still fresh, use it
      if (ageInMinutes < ttlMinutes) {
        setData(cachedData);
        setLoading(false);
        return;
      }
    }

    // 2. If no cache or expired, fetch immediately
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchFreshData(true);

    // 3. Set up auto-refresh interval (refresh when ttl expires)
    const interval = setInterval(() => {
      fetchFreshData(false); // false = don't show loading spinner on auto-refresh
    }, ttlMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [key, ttlMinutes]);

  return { data, loading };
}