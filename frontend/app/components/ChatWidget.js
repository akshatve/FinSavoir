"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sendChatMessage } from "../../lib/api";

// ─── Robot Icon Component ───
const RobotIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="16" height="12" rx="3" fill="currentColor" opacity="0.15"/>
    <rect x="4" y="8" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
    <line x1="12" y1="5.5" x2="12" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="9" cy="14" r="1.8" fill="currentColor"/>
    <circle cx="15" cy="14" r="1.8" fill="currentColor"/>
    <path d="M9 17.5 Q12 19 15 17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <line x1="2" y1="13" x2="4" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="20" y1="13" x2="22" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

function normalizeContent(content) {
  if (!content) return "";
  let fixed = content;
  fixed = fixed.replace(/(?<!^)\s*\*\*(\d+)\.\s+([A-Z]{1,5})\*\*/g, "\n\n**$1. $2**");
  fixed = fixed.replace(/([^\n])\s*\*\*([+-][\d,.]+)\s*%\*\*/g, "$1\n$2%");
  fixed = fixed.replace(/([^\n])\s*\*\*([A-Z]{2,5})\*\*\s*\n/g, "$1\n\n**$2**\n");
  fixed = fixed.replace(/\n{3,}/g, "\n\n");
  return fixed.trim();
}

const MarkdownComponents = {
  strong: ({ children }) => {
    const text = String(children).trim();
    const isPercent = /^[+-]?[\d,.]+%$/.test(text);
    const isTicker = /^[A-Z]{1,5}$/.test(text);
    if (isTicker) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#00296b]/10 dark:bg-[#00296b]/30 text-[#00296b] dark:text-[#4a7bd6] text-xs font-bold">
          {children}
        </span>
      );
    }
    if (isPercent) {
      const isPositive = text.startsWith("+");
      return (
        <span className={`font-bold tabular-nums ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
          {children}
        </span>
      );
    }
    return <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>;
  },
  p: ({ children }) => (
    <div className="mb-3 last:mb-0 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
      {children}
    </div>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-2 mb-1">{children}</h3>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-gray-900 dark:text-white mt-2 mb-1">{children}</h2>
  ),
  h1: ({ children }) => (
    <h1 className="text-lg font-bold text-gray-900 dark:text-white mt-2 mb-1">{children}</h1>
  ),
  ul: ({ children }) => <ul className="my-2 space-y-1">{children}</ul>,
  li: ({ children }) => (
    <li className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pl-1">{children}</li>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-left whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 text-sm">{children}</td>
  ),
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      abortRef.current = new AbortController();
      const body = await sendChatMessage(newMessages, abortRef.current.signal);
      if (!body) throw new Error("No response body");

      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (part.startsWith("data: ")) {
            const data = part.slice(6);
            if (data === "[DONE]") {
              setIsStreaming(false);
              break;
            }
            if (data.startsWith("[ERROR]")) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: `⚠️ ${data.slice(8)}`,
                };
                return updated;
              });
              setIsStreaming(false);
              break;
            }
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: updated[updated.length - 1].content + data,
              };
              return updated;
            });
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "⚠️ Couldn't connect. Please try again.",
          };
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = useCallback((content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const clearChat = () => {
    if (isStreaming) {
      abortRef.current?.abort();
      setIsStreaming(false);
    }
    setMessages([]);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 flex items-center justify-center"
            aria-label="Open chat"
          >
            {/* --- 1. RADAR RINGS (BEHIND THE BUTTON) --- */}
            <div className="absolute inset-0 rounded-full bg-[#00296b]/40 animate-radar-1 pointer-events-none" />
            <div className="absolute inset-0 rounded-full bg-[#00296b]/40 animate-radar-2 pointer-events-none" />

            {/* --- 2. MAIN BUTTON CIRCLE --- */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#00296b] to-[#003a94] shadow-xl shadow-[#00296b]/30 flex items-center justify-center overflow-hidden transition-transform hover:scale-105">
              {/* 3. TILTED SHINE SWEEP */}
              <span className="absolute inset-0 block overflow-hidden rounded-full pointer-events-none">
                <span
                  className="absolute top-0 h-[200%] -translate-y-1/2 w-[45%] bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shine"
                  style={{
                    transform: "skewX(-20deg)",
                    willChange: "left, transform",
                  }}
                />
              </span>

              {/* 4. ROBOT ICON */}
              <span className="relative z-10">
                <RobotIcon className="w-7 h-7 text-white" />
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-[9998] w-[400px] h-[600px] bg-white dark:bg-[#111] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00296b] to-[#003a94] flex items-center justify-center shadow-lg shadow-[#00296b]/20">
                    <RobotIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#111] rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">FinSavoir AI</h3>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#00296b]/10 dark:bg-[#00296b]/30 text-[#00296b] dark:text-[#4a7bd6]">
                      AI
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Online · Replies instantly
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Clear chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col h-full">
                  <div className="flex gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00296b] to-[#003a94] flex items-center justify-center flex-shrink-0">
                      <RobotIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        Hi! 👋 I'm FinSavoir's AI assistant. Ask me anything about a stock, market movers, or recent news.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Top gainers today", "Compare NVDA and AMD", "What is Apple's P/E?"].map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => {
                          setInput(prompt);
                          setTimeout(() => sendMessage(), 100);
                        }}
                        className="text-xs font-medium text-gray-700 dark:text-gray-300 px-3.5 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-full hover:border-[#00296b] dark:hover:border-[#4a7bd6] hover:text-[#00296b] dark:hover:text-[#4a7bd6] transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00296b] to-[#003a94] flex items-center justify-center flex-shrink-0 mt-1">
                        <RobotIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[85%] ${msg.role === "user" ? "" : "flex-1"}`}>
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          msg.role === "user"
                            ? "bg-[#00296b] text-white rounded-tr-sm"
                            : "bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        ) : msg.content ? (
                          <div className="markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                              {normalizeContent(msg.content)}
                            </ReactMarkdown>
                            {isStreaming && index === messages.length - 1 && (
                              <span className="inline-block w-2 h-4 bg-[#00296b] dark:bg-[#4a7bd6] animate-pulse ml-0.5 align-middle"></span>
                            )}
                          </div>
                        ) : (
                          <div className="flex gap-1 items-center h-5">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                          </div>
                        )}
                      </div>
                      {msg.role === "assistant" && msg.content && !isStreaming && (
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <button
                            onClick={() => copyMessage(msg.content, index)}
                            className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
                          >
                            {copiedIndex === index ? "Copied ✓" : "Copy"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 p-3">
              <div className="flex items-center gap-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 focus-within:border-[#00296b] dark:focus-within:border-[#4a7bd6] transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  disabled={isStreaming}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={isStreaming || !input.trim()}
                  className="w-8 h-8 rounded-lg bg-[#00296b] hover:bg-[#001f52] disabled:opacity-40 disabled:hover:bg-[#00296b] text-white flex items-center justify-center transition-colors flex-shrink-0"
                >
                  {isStreaming ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
                FinSavoir AI can make mistakes. Verify important information.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}