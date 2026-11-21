import Hero from "./components/Hero";
import MarketDashboard from "./components/MarketDashboard"; // <-- Import
import TrendingStocks from "./components/TrendingStocks"; // <-- Import
import TrendingNews from "./components/TrendingNews"; // <-- Import
import TrendingVideos from "./components/TrendingVideos"; // <-- Import

import Features from "./components/Features";
import DashboardPreview from "./components/DashboardPreview";
import AnnouncementBar from "./components/AnnouncementBar";
import FourSteps from "./components/FourSteps";
import CTASection from "./components/CTASection";
import SectorHeatmap from "./components/SectorHeatmap"; // <-- Import
import SECFilings from "./components/SECFilings"; // <-- Import

export default function Home() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      <Hero />
      {/* NEW: Add the Dashboard right below the Hero */}

      <AnnouncementBar />
      <FourSteps />

      <TrendingStocks />
      <div className="max-w-7xl mx-auto w-full px-6 py-12">
        <MarketDashboard />
      </div>
      <SectorHeatmap />

      <TrendingNews />
      <TrendingVideos />

      <Features />

      {/* SEC Filings takes 1 column */}
      <div className="lg:col-span-1">
        <SECFilings />
      </div>
      {/* <DashboardPreview /> */}
      <CTASection />
    </div>
  );
}
