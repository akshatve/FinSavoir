"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getAllSectors, getSectorCompanies } from "../../lib/api";
import { formatCurrency, formatNumber, formatPercent } from "../../lib/format";
import CompanyLogo from "../components/CompanyLogo";

// Hash → section name mapper (e.g., "consumer-discretionary" → "Consumer Discretionary")
const hashToSector = (hash) => {
  if (!hash) return null;
  return hash.replace("#", "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

export default function SectorsPage() {
  const [sectors, setSectors] = useState([]);
  const [companiesBySector, setCompaniesBySector] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeSector, setActiveSector] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sectionRefs = useRef({});

  // Load all sectors and their companies
  useEffect(() => {
    const loadData = async () => {
      try {
        const sectorsData = await getAllSectors();
        setSectors(sectorsData);

        const companyData = {};
        for (const sector of sectorsData) {
          const res = await getSectorCompanies(sector.name);
          companyData[sector.name] = res.companies || [];
        }
        setCompaniesBySector(companyData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Scroll to hash on mount
  useEffect(() => {
    if (loading || sectors.length === 0) return;
    const hash = window.location.hash;
    if (hash) {
      const sectorName = hashToSector(hash);
      if (sectorName) {
        const matched = sectors.find(s => s.name.toLowerCase() === sectorName.toLowerCase());
        if (matched && sectionRefs.current[matched.name]) {
          setTimeout(() => {
            sectionRefs.current[matched.name]?.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveSector(matched.name);
          }, 100);
        }
      }
    }
  }, [loading, sectors]);

  // Track scroll position for active sidebar item
  useEffect(() => {
    if (sectors.length === 0) return;
    const handleScroll = () => {
      let current = null;
      for (const sector of sectors) {
        const el = sectionRefs.current[sector.name];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = sector.name;
          }
        }
      }
      setActiveSector(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectors]);

  // Filter companies by search
  const filteredCompanies = (sectorName) => {
    const companies = companiesBySector[sectorName] || [];
    if (!searchQuery.trim()) return companies;
    const q = searchQuery.toLowerCase();
    return companies.filter(c => 
      c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8 animate-pulse"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Page Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Market Sectors</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            Explore by Sector
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Browse {sectors.length} sectors across the US market. See every company, their key metrics, and jump straight to research.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticker or name within sectors..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Two-column layout: sticky sidebar + content */}
        <div className="flex gap-8">
          
          {/* Sidebar - sticky, hidden on mobile */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 px-3">
                Jump to sector
              </h3>
              <nav className="space-y-1">
                {sectors.map((sector) => {
                  const isActive = activeSector === sector.name;
                  return (
                    <a
                      key={sector.name}
                      href={`#${sector.name.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={(e) => {
                        e.preventDefault();
                        sectionRefs.current[sector.name]?.scrollIntoView({ behavior: "smooth", block: "start" });
                        window.history.pushState(null, "", `#${sector.name.toLowerCase().replace(/\s+/g, "-")}`);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"
                      }`}
                    >
                      <span className="truncate">{sector.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                        {sector.count}
                      </span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content — sector sections */}
          <div className="flex-1 min-w-0">
            <div className="space-y-12">
              {sectors.map((sector, index) => {
                const companies = filteredCompanies(sector.name);
                if (companies.length === 0 && searchQuery.trim()) return null;
                
                return (
                  <motion.section
                    key={sector.name}
                    ref={(el) => (sectionRefs.current[sector.name] = el)}
                    id={sector.name.toLowerCase().replace(/\s+/g, "-")}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: index * 0.02 }}
                    className="scroll-mt-24"
                  >
                    {/* Sector header */}
                    <div className="flex items-end justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                          {sector.name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {companies.length} {companies.length === 1 ? "company" : "companies"}
                          {searchQuery.trim() && ` matching "${searchQuery}"`}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Companies grid */}
                    {companies.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center bg-gray-50 dark:bg-[#111] rounded-xl">
                        No companies match your search.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {companies.map((company) => {
                          const isPositive = (company.change_pct || 0) >= 0;
                          return (
                            <Link
                              key={company.ticker}
                              href={`/company/${company.ticker}`}
                              className="group bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                            >
                              {/* Top row: logo + ticker */}
                              <div className="flex items-center gap-3 mb-3">
                                <CompanyLogo ticker={company.ticker} size="w-10 h-10" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {company.ticker}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {company.name}
                                  </p>
                                </div>
                              </div>

                              {/* Bottom row: price + change */}
                              <div className="flex items-end justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Price</p>
                                  <p className="font-bold text-gray-900 dark:text-white text-sm tabular-nums">
                                    {formatCurrency(company.price || 0)}
                                  </p>
                                </div>
                                <p className={`text-sm font-bold tabular-nums ${
                                  isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                                }`}>
                                  {isPositive ? "+" : ""}{(company.change_pct || 0).toFixed(2)}%
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </motion.section>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}