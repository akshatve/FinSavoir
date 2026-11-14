'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: "FinSavoir completely changed how I do fundamental analysis. Having the source filings one click away saves me hours every week.",
    name: "Sarah Jenkins",
    role: "Portfolio Manager · Apex Capital",
    initials: "SJ",
    accent: "#3b82f6",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote: "The peer comparison feature is a game changer. I can line up 5 companies and instantly see who is generating the most free cash flow. Incredible.",
    name: "David Chen",
    role: "Retail Investor · Independent",
    initials: "DC",
    accent: "#8b5cf6",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote: "I've used Bloomberg and FactSet for years. FinSavoir's clean UI and direct SEC linking is refreshingly fast and intuitive.",
    name: "Elena Rodriguez",
    role: "Equity Analyst · Meridian Research",
    initials: "ER",
    accent: "#10b981",
    img: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote: "As a student, I couldn't afford expensive terminals. FinSavoir gives me institutional-grade data for free. It's an invaluable learning tool.",
    name: "Marcus Thompson",
    role: "Finance Student · NYU Stern",
    initials: "MT",
    accent: "#f59e0b",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote: "The TTM views and historical data are perfectly organized. It's the first tab I open when a new deal crosses my desk.",
    name: "Priya Sharma",
    role: "Venture Capitalist · Sequoia India",
    initials: "PS",
    accent: "#ec4899",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote: "The transparency of the financial ratios is unmatched. I can see exactly how a metric is calculated and trace it back to the 10-K.",
    name: "James Wilson",
    role: "Hedge Fund PM · Citadel",
    initials: "JW",
    accent: "#6366f1",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
  },
];

export default function Testimonials() {
  const [page, setPage] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef(null);

  const PER_PAGE = 3;
  const PAGES = Math.ceil(TESTIMONIALS.length / PER_PAGE);
  const visible = TESTIMONIALS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = (dir) => {
    setPage((p) => (p + dir + PAGES) % PAGES);
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-white dark:bg-[#0a0a0a] py-6 lg:py-12 overflow-hidden transition-colors duration-300"
    >
      {/* Background Glow */}
      {/* <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div> */}

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 lg:px-14">

        {/* Header */}
        <header className="flex flex-col items-center text-center mb-14 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mb-6">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">4.9/5 from 1,200+ reviews</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            Our Clients{' '}
            <span className="text-transparent bg-clip-text bg-[#094cb9]">
              Speak.
            </span>
          </h2>
        </header>

        {/* Slider */}
        <div className="relative">
          <button
            onClick={() => go(-1)}
            className="hidden lg:grid absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 place-items-center w-12 h-12 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white transition-all hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black shadow-md"
          >
            <ArrowLeft size={18} />
          </button>

          <button
            onClick={() => go(1)}
            className="hidden lg:grid absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 place-items-center w-12 h-12 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white transition-all hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black shadow-md"
          >
            <ArrowRight size={18} />
          </button>

          {/* Cards Grid with Stretch */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch transition-all duration-700 ease-out ${
              revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {visible.map((t, i) => {
              const isCenter = i === 1;
              return (
                <article key={t.name + i} className="flex flex-col h-full">
                  
                  {/* Speech Bubble with flex-1 to fill remaining space */}
                  <div
                    className={`relative w-full flex-1 rounded-3xl p-7 transition-all duration-500 ${
                      isCenter
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-2xl scale-105'
                        : 'bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1a1a1a] hover:shadow-lg'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed">
                      "{t.quote}"
                    </p>
                    {/* Speech bubble tail */}
                    <span
                      className={`absolute left-10 -bottom-2 w-4 h-4 rotate-45 ${
                        isCenter ? 'bg-gray-900 dark:bg-white' : 'bg-gray-50 dark:bg-[#111] border-r border-b border-gray-200 dark:border-gray-800'
                      }`}
                    />
                  </div>

                  {/* Author pinned to bottom */}
                  <div className="mt-8 flex items-center gap-4 px-2 w-full">
                    <div className="relative shrink-0 w-14 h-14 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-lg" style={{ background: t.accent }}>
                      <img
                        src={t.img}
                        alt={t.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-gray-900 dark:text-white">{t.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.role}</div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-16 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            {Array.from({ length: PAGES }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === page ? 'w-8 h-2 bg-blue-600' : 'w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}