import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { StatsSection } from "../components/StatsSection";
import { CTASection } from "../components/CTASection";
import { Footer } from "../components/Footer";
import { StarrySky } from "../components/StarrySky";
import "../landing.css";

export function LandingPage() {
  return (
    <div
      className="relative min-h-screen selection:bg-[#f5a623] selection:text-[#060e1a] text-white"
      style={{ backgroundColor: "#060e1a" }}
    >
      {/* Dynamic Starry Sky & Celestial Cosmos Background */}
      <StarrySky />

      {/* Main Content Layer */}
      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <StatsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
