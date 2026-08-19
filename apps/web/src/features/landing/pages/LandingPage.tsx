import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { TerminalPreviewSection } from "../components/TerminalPreviewSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { PricingSection } from "../components/PricingSection";
import { DataPrivacySection } from "../components/DataPrivacySection";
import { FAQSection } from "../components/FAQSection";
import { CTASection } from "../components/CTASection";
import { Footer } from "../components/Footer";
import { PageTransition } from "../../../common/components/layout/PageTransition";
import "../landing.css";

export function LandingPage() {
  return (
    <PageTransition>
      <div className="landing-canvas min-h-screen bg-white text-black selection:bg-black selection:text-white">
        <Navbar />
        <main>
          <HeroSection />
          <TerminalPreviewSection />
          <FeaturesSection />
          <HowItWorksSection />
          <PricingSection />
          <DataPrivacySection />
          <FAQSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
