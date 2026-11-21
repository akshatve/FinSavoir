"use client";

import { useState } from "react";
import { subscribeNewsletter } from "../../lib/api";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setError("");

    try {
      await subscribeNewsletter(email);
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  return (
    <section className="relative w-full py-8 lg:py-12 bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-gray-800 transition-colors duration-300 overflow-hidden">
      {/* ================= BACKGROUND GRID PATTERN (Same as Hero) ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-blue-100/5 to-transparent dark:from-blue-600/10 dark:via-transparent dark:to-transparent blur-3xl opacity-70" />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* LEFT: Institutional Copy */}
          <div>
            {/* Small Tag */}
            {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                Priority Access
              </span>
            </div> */}

            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6">
              Research deeper. <br />
              <span className="text-transparent bg-clip-text bg-[#094cb9]">
                Decide faster.
              </span>
            </h2>

            {/* <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              Join a growing network of analysts, portfolio managers, and
              independent investors using FinSavoir to perform
              institutional-grade fundamental research.
            </p> */}

            {/* Value Props List */}
            <ul className="space-y-4">
              {[
                "Unrestricted access to SEC EDGAR filings",
                "Build and track a watchlist",
                "See detailed financial statements",
                "Compare peer stocks side by side",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <svg
                      className="w-3 h-3 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT: Clean Email Capture Card */}
          <div className="bg-white dark:bg-[#111] p-8 lg:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl shadow-gray-200/60 dark:shadow-black/60">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Subscribe to our newsletter 
            </h3>
            {/* <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Enter your professional email to receive an early access link.
            </p> */}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                {/* <label
                  htmlFor="email"
                  className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2"
                >
                  Professional Email
                </label> */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@firm.com"
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={status !== "idle"}
                className={`w-full py-4 px-4 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
                  status === "success"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-md"
                }`}
              >
                {status === "idle" && "Submit"}
                {status === "loading" && (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Processing...
                  </>
                )}
                {status === "success" && (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Submitted Successfully
                  </>
                )}
              </button>
            </form>

            {/* <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                By requesting access, you agree to our{" "}
                <a
                  href="/terms"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
