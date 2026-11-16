import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MarketTicker from "./components/MarketTicker";

import WatchlistSidebar from "./components/WatchlistSidebar"; // <-- Add
import { ThemeProvider } from "./providers";
import { WatchlistProvider } from "../lib/WatchlistContext"; // <-- Add
import { RecentlyViewedProvider } from "../lib/RecentlyViewedContext"; // <-- Add
import ChatWidget from "./components/ChatWidget";

import StockMarquee from "./components/StockMarquee";
import "./globals.css";

export const metadata = {
  title: "FinSavoir",
  description: "Know the Business. Beyond the stock price.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <WatchlistProvider>
            <RecentlyViewedProvider>
              <StockMarquee />
              <Navbar />
              <MarketTicker />
              <main className="flex-1">{children}</main>

              <Footer />
              <WatchlistSidebar />
              <ChatWidget />
            </RecentlyViewedProvider>
          </WatchlistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
