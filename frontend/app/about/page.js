import AboutHero from "./components/AboutHero";
import AboutHowItHelps from "./components/AboutHowItHelps";
import AboutWhatYouGet from "./components/AboutWhatYouGet";
import AboutDistinctions from "./components/AboutDistinctions";
import AboutCoverage from "./components/AboutCoverage";

export const metadata = {
  title: "About — FinSavoir",
  description: "Company research, with the evidence in reach. FinSavoir helps you understand public companies through their SEC filings.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full">
      <AboutHero />
      <AboutHowItHelps />
      <AboutWhatYouGet />
      <AboutDistinctions />
      <AboutCoverage />
    </div>
  );
}