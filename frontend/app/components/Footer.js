"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Home", href: "/" },
        { name: "Stocks", href: "/stocks" },
        { name: "Sectors", href: "/sectors" },
        { name: "Markets", href: "/markets" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "News", href: "/news" },
        { name: "Press", href: "/press-releases" },
        { name: "Fillings", href: "/filings" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        // { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
        // { name: "Legal", href: "/legal" },
      ],
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#050505] overflow-hidden">
      
      {/* Colorful Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* ================= MAIN FOOTER CONTENT ================= */}
      <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-6 z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand */}
          <div className="lg:col-span-5 pr-8">
            <Link href="/" className="inline-block mb-6 group">
              <img 
                src="/logo/logo2.png" 
                alt="FinSavoir Logo" 
                className="h-16 w-auto object-contain group-hover:scale-105 transition-transform" 
              />
            </Link>
            
            {/* <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-[1.15] mb-6">
              See the business. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Beyond the stock price.
              </span>
            </h3> */}
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-8">
              The ultimate platform for SEC filing research, financial analysis, and peer comparison. Built for investors who demand transparency and evidence.
            </p>

            {/* Back to Top Button */}
            <button 
              onClick={scrollToTop}
              className="group inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
            >
              <span className="text-xs font-bold text-white uppercase tracking-wider">Back to Top</span>
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center group-hover:-translate-y-0.5 transition-transform">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
            </button>
          </div>

          {/* Columns 2, 3, 4: Links */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footerLinks.map((column, index) => (
              <div key={index}>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">
                  {column.title}
                </h4>
                <ul className="space-y-4">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link 
                        href={link.href} 
                        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                      >
                        {/* Static Left Line - Always Visible */}
                        <span className="w-3 h-px bg-blue-500"></span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-8"></div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-xs font-medium text-gray-500">
            <p>© {currentYear} FinSavoir. All rights reserved.</p>
            <div className="hidden md:block w-1 h-1 rounded-full bg-gray-700"></div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>

          {/* Social Icons with REAL Colors (Always Visible) */}
          <div className="flex items-center gap-3">
            
            {/* X (Twitter) - Solid White Background with Black Icon */}
            <a 
              href="#" 
              className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black hover:scale-110 transition-transform shadow-lg"
              aria-label="X"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* Instagram - Gradient Background */}
            <a 
              href="#" 
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* Facebook - Solid Facebook Blue */}
            <a 
              href="#" 
              className="w-8 h-8 rounded-xl bg-[#1877F2] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* LinkedIn - Solid LinkedIn Blue */}
            <a 
              href="#" 
              className="w-8 h-8 rounded-xl bg-[#0A66C2] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}