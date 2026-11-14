"use client";

import Link from "next/link";

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">

      {/* ===== HERO ===== */}
      <div className=" border-gray-200 dark:border-gray-800  dark:bg-gray-900/20">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full">
              Draft · Version 2026-09-27
            </span>
            <Link
              href="/privacy"
              className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline"
            >
              See also: Privacy Notice →
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white max-w-3xl leading-tight">
            Terms of Use
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-4 max-w-2xl leading-relaxed">
            The rules for using FinSavoir — what the product is, where the data comes from, and what you're agreeing to.
          </p>

          <div className="mt-6 bg-amber-50/60 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-r-xl px-5 py-4 max-w-3xl">
            <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong>Draft for review.</strong> This text describes how FinSavoir works today. It has not yet been reviewed by a lawyer and is not the final text for a public launch.
            </p>
          </div>
        </div>
      </div>

      {/* ===== AT-A-GLANCE SUMMARY ===== */}
      <div className="max-w-6xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: "Not investment advice", desc: "Research tool, not a recommendation to buy or sell.", color: "from-blue-500 to-indigo-600" },
            { title: "SEC is authoritative", desc: "Figures come from EDGAR XBRL. Linked filings override us.", color: "from-emerald-500 to-teal-600" },
            { title: "You control your account", desc: "Delete anytime. Keep your password private.", color: "from-purple-500 to-fuchsia-600" },
            { title: "Alerts are best-effort", desc: "We try to deliver, but timing is not guaranteed.", color: "from-orange-500 to-amber-600" },
          ].map((item) => (
            <div
              key={item.title}
              className={`bg-gradient-to-br ${item.color} text-white rounded-2xl p-5 shadow-lg`}
            >
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">At a glance</p>
              <p className="text-base font-black">{item.title}</p>
              <p className="text-xs opacity-90 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== MAIN CONTENT WITH SIDEBAR ===== */}
      <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col lg:flex-row gap-12">

        {/* Sticky sidebar */}
        <aside className="lg:w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-3 px-3">
              On this page
            </p>
            {[
              { id: "what", label: "What FinSavoir is" },
              { id: "data", label: "Data" },
              { id: "account", label: "Your account" },
              { id: "operator", label: "Operator & governing law" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Main prose */}
        <div className="flex-1 max-w-3xl space-y-16">

          {/* ===== 01 · WHAT FINSAVOIR IS ===== */}
          <section id="what" className="space-y-4">
            <SectionHeader number="01" title="What FinSavoir is" />
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              FinSavoir is a <strong>research tool</strong> that turns public SEC filings into reports, with a link to the filing behind each figure. FinSavoir is <strong>not investment advice</strong> and does not tell you what to buy or sell.
            </p>
            <div className="bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-blue-500 rounded-r-xl p-5">
              <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                <strong>Model estimates are mechanical and can be wrong.</strong> Screens, scores, and summaries are generated by fixed rules from reported figures — not written by an analyst and not a forecast of future performance.
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              The Pro Score, Summary Analysis, and any peer comparison are <em>descriptive assessments</em>. A score of 80/100 does not mean an 80% chance of profit or safety. No test has shown that these numbers predict returns, defaults or future results.
            </p>
          </section>

          {/* ===== 02 · DATA ===== */}
          <section id="data" className="space-y-4">
            <SectionHeader number="02" title="Data" />
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Figures come from the <strong>U.S. Securities and Exchange Commission</strong> (EDGAR XBRL). FinSavoir may make mistakes in processing them; <strong>the linked filing is the authoritative source.</strong>
            </p>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Authoritative</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  SEC filings — the 10-K, 10-Q and 8-K documents the company filed. Every figure links to the exact filing it came from.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">Derived</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Ratios, scores, and summaries FinSavoir computes from the filings. If a derived number disagrees with the filing, the filing wins.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-2">
              Historical data may be restated by the company after we've displayed it. FinSavoir refreshes from SEC on a regular schedule, but old cached views may show pre-restatement figures until the next refresh.
            </p>
          </section>

          {/* ===== 03 · YOUR ACCOUNT ===== */}
          <section id="account" className="space-y-4">
            <SectionHeader number="03" title="Your account" />
            <div className="space-y-3">
              {[
                { title: "Keep your password to yourself.", body: "You're responsible for activity under your login. If you suspect a compromise, change your password immediately." },
                { title: "You can delete your account at any time.", body: "Deleting removes your saved lists, alerts, and preferences. See the Privacy Notice for what is deleted and how." },
                { title: "Alerts are best-effort.", body: "FinSavoir does not guarantee that an alert arrives, or when. Do not rely on alerts for time-sensitive decisions." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold text-xs flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== 04 · OPERATOR & GOVERNING LAW ===== */}
          <section id="operator" className="space-y-4">
            <SectionHeader number="04" title="Operator & governing law" />
            <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40 rounded-xl p-6">
              <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong>To be completed before a public launch.</strong> Operator name, contact address, and governing law will be published in the final version of these terms.
              </p>
            </div>
          </section>

          {/* ===== FOOTER ===== */}
          <div className="pt-10 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-500 space-y-2">
            <p className="font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">Document Info</p>
            <p>Version draft-2026-09-27 · These terms describe how FinSavoir works today.</p>
            <p>FinSavoir is a research tool, not investment advice. All content is for informational purposes only.</p>
          </div>

        </div>
      </div>

      {/* ===== CTA FOOTER ===== */}
      <div className="bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Related documents</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            These terms work together with our privacy notice. Both are drafts pending final review.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/privacy" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-blue-500/20">
              Privacy Notice
            </Link>
            <Link href="/contact" className="px-6 py-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-sm font-bold rounded-xl hover:border-blue-300 transition-colors">
              Contact us
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

// Reusable section header
function SectionHeader({ number, title }) {
  return (
    <div className="flex items-center gap-4 pb-2">
      <span className="text-xs font-black text-blue-600 dark:text-blue-400 tabular-nums bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1 rounded-lg">
        {number}
      </span>
      <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
        {title}
      </h2>
    </div>
  );
}