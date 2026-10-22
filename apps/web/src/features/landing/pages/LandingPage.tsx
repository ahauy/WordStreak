import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { GuestFlashcardPreview } from "../components/GuestFlashcardPreview";
import { TerminalPreviewSection } from "../components/TerminalPreviewSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { PricingSection } from "../components/PricingSection";
import { DataPrivacySection } from "../components/DataPrivacySection";
import { FAQSection } from "../components/FAQSection";
import { CTASection } from "../components/CTASection";
import { Footer } from "../components/Footer";
import { PageTransition } from "../../../common/components/layout/PageTransition";
import { Sparkles } from "lucide-react";
import "../landing.css";

export function LandingPage() {
  return (
    <PageTransition>
      <div className="landing-canvas min-h-screen bg-white text-black selection:bg-black selection:text-white">
        <Navbar />
        <main>
          <HeroSection />

          {/* Guest Interactive Flashcard Preview (US-START-03) */}
          <section id="guest-preview" className="py-12 sm:py-16 bg-[#fafafa] border-y border-[#e5e5e5]">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center mb-8">
              <span className="command-tag-chip mb-3">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-black" />
                Học thử trước khi đăng ký
              </span>
              <h2 className="heading-lg">
                Trải nghiệm 5 thẻ từ vựng đầu tiên
              </h2>
              <p className="body-sm mt-1.5 text-[#737373]">
                Khám phá thuật toán lặp lại ngắt quãng SuperMemo-2 ngay trên trình duyệt mà không cần tạo tài khoản.
              </p>
            </div>
            <div className="px-4 sm:px-6">
              <GuestFlashcardPreview />
            </div>
          </section>

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
