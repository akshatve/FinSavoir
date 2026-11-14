"use client";

import Link from "next/link";

export default function PrivacyNoticePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">

      {/* ===== HERO ===== */}
      <div className=" border-gray-200 dark:border-gray-800 dark:bg-gray-900/20">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full">
              Draft · Version 2026-09-27
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white max-w-3xl leading-tight">
            Privacy Notice
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-4 max-w-2xl leading-relaxed">
            How FinSavoir handles your data — what we collect, what we don't, and what you control. Written in plain English.
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
            { title: "No tracking", desc: "No cookies, no analytics without your consent.", color: "from-emerald-500 to-teal-600" },
            { title: "Account = email only", desc: "We store your email, not your password.", color: "from-blue-500 to-indigo-600" },
            { title: "Emails opt-in", desc: "Every email has a one-click unsubscribe.", color: "from-purple-500 to-fuchsia-600" },
            { title: "You own your data", desc: "Download or delete everything, anytime.", color: "from-orange-500 to-amber-600" },
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
              { id: "without-account", label: "Without an account" },
              { id: "with-account", label: "With an account" },
              { id: "emails", label: "Emails" },
              { id: "analytics", label: "Usage analytics" },
              { id: "choices", label: "Your choices" },
              { id: "security", label: "Security" },
              { id: "contact", label: "Contact" },
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

          {/* ===== WITHOUT ACCOUNT ===== */}
          <section id="without-account" className="space-y-4">
            <SectionHeader number="01" title="Without an account" />
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              You can read every company report <strong>without an account</strong>. FinSavoir sets no tracking cookies and records no analytics about you. Saved companies, your peer lists and scenarios stay in your browser. Like any website, the servers log requests for operations and security; how long those logs are kept is to be set before a public launch.
            </p>

            <div className="bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-blue-500 rounded-r-xl p-5">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                One exception, only if you ask for it
              </h4>
              <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                The <strong>TradingView buttons</strong> ("Show index levels", "Show world indices", a company's "Show the price chart" and the World Indices page's quotes) load TradingView's widgets from TradingView's servers. From then on TradingView receives the request like any website you visit and its own privacy policy applies. Nothing is sent to TradingView unless you press a button.
              </p>
              <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed mt-2">
                If you leave <em>"Remember on this device"</em> ticked, your browser stores that choice (localStorage key <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs">finsavoir-tv</code>, never sent to FinSavoir) and the widgets load on later visits; <em>"Stop showing TradingView widgets"</em> removes it.
              </p>
            </div>

            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              The homepage's News lists official releases of the Federal Reserve Board and the SEC, and headlines of any publisher enabled with permission, which FinSavoir's server reads from their feeds. Where article images are shown, your browser loads them from the publisher's image server (image.cnbcfm.com, assets.bwbx.io), and each headline opens the article on the publisher's site, where its own privacy policy applies.
            </p>
          </section>

          {/* ===== WITH ACCOUNT ===== */}
          <section id="with-account" className="space-y-4">
            <SectionHeader number="02" title="With an account" />
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              When you create an account, FinSavoir stores only what's necessary to make the service work. Here is exactly what we keep:
            </p>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              {[
                { label: "Email & password", body: "Handled by our sign-in service (Supabase Auth). FinSavoir never sees your password." },
                { label: "Account basics", body: "Your email address (to send the alerts you ask for), an optional display name, your time zone and digest time." },
                { label: "Your activity", body: "Watchlists, saved comparisons, alert settings and notifications." },
                { label: "Consent records", body: "Records of what you agreed to (terms, privacy notice, emails, analytics), with the version and time." },
                { label: "Email log", body: "For each email sent: when, what kind, and a one-way hash of the address — never the address itself." },
              ].map((item, i) => (
                <li key={i} className="flex gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold text-xs flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* ===== EMAILS ===== */}
          <section id="emails" className="space-y-4">
            <SectionHeader number="03" title="Emails" />
            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-6">
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                FinSavoir emails you only after you <strong>turn email alerts on</strong>, and every email has a link to unsubscribe without signing in. Unsubscribing keeps a one-way hash of your address so it is never emailed again.
              </p>
            </div>
          </section>

          {/* ===== ANALYTICS ===== */}
          <section id="analytics" className="space-y-4">
            <SectionHeader number="04" title="Usage analytics (optional)" />
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Off unless you turn it on</strong> in your account. When on, FinSavoir records a few event types with the page type (for example "a company report", never which company), a result-count range for searches (never what you searched), and the time.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside pl-4">
              <li>No third-party analytics or advertising tools are used.</li>
              <li>Records are deleted after 13 months.</li>
            </ul>
          </section>

          {/* ===== YOUR CHOICES ===== */}
          <section id="choices" className="space-y-4">
            <SectionHeader number="05" title="Your choices" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Download everything", desc: "Get all data FinSavoir keeps about you from your account page.", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
                { title: "Delete your account", desc: "Your data and sign-in are removed completely.", icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" },
                { title: "Turn emails on or off", desc: "Change preferences at any time from your account.", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                { title: "Turn analytics on or off", desc: "Opt out of usage tracking anytime.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== SECURITY ===== */}
          <section id="security" className="space-y-4">
            <SectionHeader number="06" title="Security" />
            <div className="space-y-3">
              {[
                "Sign-in tokens are kept in cookies that page scripts cannot read.",
                "Each person's data is separated at the database level.",
                "FinSavoir does not sell personal data.",
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ===== CONTACT ===== */}
          <section id="contact" className="space-y-4">
            <SectionHeader number="07" title="Contact" />
            <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40 rounded-xl p-6">
              <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong>To be completed before a public launch</strong> — operator name and contact address.
              </p>
            </div>
          </section>

          {/* ===== FOOTER ===== */}
          <div className="pt-10 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-500 space-y-2">
            <p className="font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">Document Info</p>
            <p>Version draft-2026-09-27 · This notice describes how FinSavoir works today.</p>
            <p>FinSavoir does not sell personal data. All content is for informational purposes only and is not investment advice.</p>
          </div>

        </div>
      </div>

      {/* ===== CTA FOOTER ===== */}
      <div className="bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Questions about your privacy?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            If you'd like to know how your data is handled or make a request, you can reach us from your account page or by email.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-blue-500/20">
              Contact us
            </Link>
            <Link href="/terms" className="px-6 py-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-sm font-bold rounded-xl hover:border-blue-300 transition-colors">
              Terms of service
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