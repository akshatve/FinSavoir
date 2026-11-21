"use client";

import { useState } from "react";
import { submitContactForm } from "../../lib/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      await submitContactForm(formData);
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Hero */}
      <section className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6 lg:py-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6">
              Get in touch with our team.
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
              Whether you have a question about features, pricing, or anything
              else — our team is ready to answer all your questions.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info (Left Sidebar) */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
              Contact Information
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Email & Support
                </p>
                <a
                  href="mailto:finsavoir30@gmail.com"
                  className="text-base font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  finsavoir30@gmail.com
                </a>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Response Time
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  Within 24 hours
                </p>
              </div>
            </div>

            {/* Divider */}
            {/* <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Looking for something else?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Check our help center for instant answers.
              </p>
              <a
                href="/help"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#094cb9] dark:text-[#0a56cf] hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Visit Help Center
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            </div> */}
          </div>

          {/* Contact Form (Right, 2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 lg:p-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Send us a message
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                Fill out the form below and we'll respond as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094cb9] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="john@company.com"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094cb9] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094cb9] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Provide as much detail as possible..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094cb9] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                    By submitting this form, you agree to our privacy policy.
                  </p>
                  <button
                    type="submit"
                    disabled={status !== "idle"}
                    className={`inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-lg transition-all ${
                      status === "success"
                        ? "bg-emerald-600 text-white"
                        : "bg-[#094cb9] hover:bg-[#0842a0] text-white shadow-sm"
                    }`}
                  >
                    {status === "idle" && "Send Message"}
                    {status === "loading" && (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Sending...
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
                        Sent
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
