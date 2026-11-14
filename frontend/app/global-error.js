"use client";

import { motion } from "framer-motion";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-[#0a0a0a]">
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mx-auto mb-8 shadow-2xl"
            >
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              A critical error occurred
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The application encountered a fatal error. Please refresh the page or contact support if the problem persists.
            </p>
            <button
              onClick={() => reset()}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}