"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// ─── Floating Stock Candlestick ───
const FloatingCandle = ({ x, y, delay, color, height }) => (
  <motion.div
    className="absolute"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.3, 1],
      y: [0, -20, 0],
    }}
    transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, delay, ease: "easeInOut" }}
  >
    <div
      className={`w-1.5 ${color}`}
      style={{ height: `${height}px`, marginBottom: `${Math.random() * 20}px` }}
    />
  </motion.div>
);

// ─── Orbiting Satellite ───
const Satellite = ({ radius, duration, startAngle, size = 10 }) => (
  <motion.div
    className="absolute top-1/2 left-1/2"
    animate={{ rotate: 360 }}
    transition={{ duration, repeat: Infinity, ease: "linear", delay: startAngle / 360 * duration }}
    style={{ width: radius * 2, height: radius * 2, marginLeft: -radius, marginTop: -radius }}
  >
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50"
      style={{ width: size, height: size }}
    />
  </motion.div>
);

// ─── Rotating Earth SVG ───
const Earth = ({ size = 100 }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    animate={{ rotate: 360 }}
    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
  >
    <defs>
      <radialGradient id="earthGrad">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1e40af" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="40" fill="url(#earthGrad)" />
    <motion.ellipse
      cx="50" cy="50" rx="40" ry="40"
      fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="2 4"
      animate={{ rx: [40, 5, 40], opacity: [1, 0.3, 1] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
    {/* Continents (abstract) */}
    <motion.path
      d="M20,30 Q30,25 35,35 T45,40 Q40,50 30,45 T20,30"
      fill="#22c55e"
      animate={{ opacity: [0.8, 0.4, 0.8] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <motion.path
      d="M60,20 Q70,25 75,35 T70,50 Q60,45 55,35 T60,20"
      fill="#22c55e"
      animate={{ opacity: [0.6, 0.3, 0.6] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
  </motion.svg>
);

// ─── Digital Clock ───
const DigitalClock = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-cyan-400 text-lg tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
      {time}
    </div>
  );
};

// ─── Mini Stock Ticker ───
const MiniTicker = () => {
  const stocks = [
    { symbol: "AAPL", change: "+2.4%", up: true },
    { symbol: "NVDA", change: "+5.1%", up: true },
    { symbol: "TSLA", change: "-1.8%", up: false },
    { symbol: "MSFT", change: "+0.9%", up: true },
    { symbol: "AMD", change: "+3.2%", up: true },
  ];
  return (
    <div className="flex gap-3">
      {stocks.map((s, i) => (
        <motion.div
          key={s.symbol}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 + i * 0.1 }}
          className={`px-2 py-1 rounded text-xs font-mono font-bold ${
            s.up ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
          }`}
        >
          {s.symbol} {s.change}
        </motion.div>
      ))}
    </div>
  );
};

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-black flex flex-col items-center justify-center overflow-hidden px-6">
      
      {/* ================= DEEP SPACE BACKGROUND ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        
        {/* Starfield (100+ stars) */}
        {[...Array(150)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}

        {/* Nebula glows */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl"
        />

        {/* Shooting stars */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`shooting-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]"
            style={{ top: `${Math.random() * 40}%`, left: `${Math.random() * 100}%` }}
            animate={{
              x: [0, 300],
              y: [0, 200],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 4 + Math.random() * 6,
              delay: Math.random() * 5,
            }}
          />
        ))}

        {/* Floating candlestick charts (30+) */}
        {[...Array(30)].map((_, i) => (
          <FloatingCandle
            key={`candle-${i}`}
            x={Math.random() * 100}
            y={Math.random() * 100}
            delay={Math.random() * 3}
            color={Math.random() > 0.5 ? "bg-emerald-500" : "bg-red-500"}
            height={Math.random() * 30 + 10}
          />
        ))}

        {/* Orbiting satellites around center */}
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          <Satellite radius={180} duration={12} startAngle={0} size={8} />
          <Satellite radius={250} duration={18} startAngle={120} size={10} />
          <Satellite radius={320} duration={25} startAngle={240} size={6} />
          <Satellite radius={400} duration={35} startAngle={60} size={12} />
        </div>

        {/* Orbital rings */}
        {[180, 250, 320, 400].map((r) => (
          <motion.div
            key={`ring-${r}`}
            className="absolute top-1/2 left-1/2 rounded-full border border-cyan-500/10"
            style={{ width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20 + r, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      {/* ================= CORNER HUD ELEMENTS ================= */}
      
      {/* Top-left: Stock ticker */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute top-8 left-8 z-20 hidden md:block"
      >
        <div className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest mb-2">Live Markets</div>
        <MiniTicker />
      </motion.div>

      {/* Top-right: Digital clock */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute top-8 right-8 z-20 hidden md:block text-right"
      >
        <div className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest mb-2">System Time</div>
        <DigitalClock />
        <div className="text-[10px] font-mono text-gray-500 mt-1">UTC {new Date().toISOString().slice(11, 16)}</div>
      </motion.div>

      {/* Bottom-left: Earth */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 1, type: "spring" }}
        className="absolute bottom-8 left-8 z-20 hidden md:block"
      >
        <Earth size={80} />
        <div className="text-[10px] font-mono text-cyan-400/70 text-center mt-2">ORBIT · 42,000 km</div>
      </motion.div>



      {/* ================= MAIN CONTENT ================= */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto text-center">
        
        {/* Glowing 404 with glitch */}
        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, scale: 0.3, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
            className="text-[140px] md:text-[240px] font-black leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 select-none relative z-10"
            style={{
              filter: "drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))",
            }}
          >
            404
          </motion.h1>

          {/* Glitch layers */}
          <motion.span
            className="absolute inset-0 text-[140px] md:text-[240px] font-black leading-none tracking-tighter text-red-500/40 pointer-events-none select-none mix-blend-screen"
            animate={{ x: [0, -4, 4, -2, 0], y: [0, 2, -2, 0] }}
            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
          >
            404
          </motion.span>
          <motion.span
            className="absolute inset-0 text-[140px] md:text-[240px] font-black leading-none tracking-tighter text-cyan-500/40 pointer-events-none select-none mix-blend-screen"
            animate={{ x: [0, 4, -4, 2, 0], y: [0, -2, 2, 0] }}
            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2.5 }}
          >
            404
          </motion.span>
        </div>

        {/* Floating robot with jetpack */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative my-6"
        >
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="100" height="130" viewBox="0 0 24 24" fill="none" className="text-orange-400">
              {/* Jetpack flames */}
              <motion.ellipse
                cx="8" cy="22" rx="1" ry="1.5" fill="currentColor"
                animate={{ ry: [1.5, 3, 1.5], opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
              <motion.ellipse
                cx="16" cy="22" rx="1" ry="1.5" fill="currentColor"
                animate={{ ry: [1.5, 3, 1.5], opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.3, repeat: Infinity, delay: 0.15 }}
              />
              
              {/* Robot body */}
              <rect x="4" y="6" width="16" height="12" rx="3" fill="currentColor" opacity="0.15"/>
              <rect x="4" y="6" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              
              {/* Antenna */}
              <motion.circle
                cx="12" cy="2.5" r="1.2" fill="currentColor"
                animate={{ opacity: [1, 0.3, 1], r: [1.2, 1.5, 1.2] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <line x1="12" y1="3.7" x2="12" y2="6" stroke="currentColor" strokeWidth="1.2"/>
              
              {/* Eyes */}
              <motion.circle cx="9" cy="11" r="1.5" fill="currentColor"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
              />
              <motion.circle cx="15" cy="11" r="1.5" fill="currentColor"
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
              />
              
              {/* Smile */}
              <path d="M9 14.5 Q12 16 15 14.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
            </svg>
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight"
        >
          Lost in{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            cyberspace
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-lg text-gray-400 mb-10 max-w-lg"
        >
The requested route could not be found. Please return to the homepage or use the search terminal to locate your destination.        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_50px_rgba(34,211,238,0.8)] transition-all"
            >
              <motion.svg
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </motion.svg>
              Home
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/stocks"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/5 backdrop-blur-sm border border-cyan-500/30 text-cyan-400 font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Scan Stocks
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}