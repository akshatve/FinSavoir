"use client";

import { motion } from "framer-motion";

export default function AboutDistinctions() {
  const distinctions = [
    {
      title: "Reported",
      desc: "What the company filed with the SEC, linked to the filing where supported.",
      gradient: "from-[#094cb9] to-[#094cb9]",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
      textColor: "text-gray-700 dark:text-gray-700",
      subColor: "text-gray-700 dark:text-gray-600",
    },
    {
      title: "Calculated",
      desc: "Measures such as margins and growth, worked out from reported lines, with the formula shown.",
      gradient: "from-[#094cb9] to-[#094cb9]",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      border: "border-indigo-200 dark:border-indigo-800",
        textColor: "text-gray-700 dark:text-gray-700",
      subColor: "text-gray-700 dark:text-gray-600",
    },
    {
      title: "Estimated",
      desc: "Experimental model forecasts and scenarios you build, labelled as estimates, not predictions.",
      gradient: "from-[#094cb9] to-[#094cb9]",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-200 dark:border-purple-800",
       textColor: "text-gray-700 dark:text-gray-700",
      subColor: "text-gray-700 dark:text-gray-600",
    },
  ];

  return (
    <section className="w-full py-12 bg-gray-50 dark:bg-[#050505] border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#094cb9] dark:text-[#0b58d4] uppercase tracking-widest">Why distinctions matter</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mt-3 mb-6">
            Know what you're <br />
            <span className="text-transparent bg-clip-text bg-[#094cb9]">
              looking at.
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Reported figures, calculated measures, and estimates answer different questions. FinSavoir keeps those distinctions visible so you can examine the evidence and form your own view.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {distinctions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`relative p-8 rounded-3xl bg-white border ${item.border} overflow-hidden`}
            >
              {/* Top gradient bar */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.gradient}`}></div>

              <h3 className={`text-2xl font-black ${item.textColor} mb-4 mt-2`}>{item.title}</h3>
              <p className={`text-sm ${item.subColor} leading-relaxed`}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}