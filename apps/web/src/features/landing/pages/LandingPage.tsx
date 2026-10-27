import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "../components/Navbar";
import { PrologueSection } from "../components/PrologueSection";
import { PricingSection } from "../components/PricingSection";
import { FAQSection } from "../components/FAQSection";
import { FinaleSection } from "../components/FinaleSection";
import { Footer } from "../components/Footer";
import { AuthDialog } from "../components/AuthDialog";
import { MenuDialog } from "../components/MenuDialog";
import "../landing.css";

const STAGE_AT = [0, 0.2, 0.44, 0.66, 0.88];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function stageFor(progress: number) {
  let index = 0;
  for (let i = 1; i < STAGE_AT.length; i += 1) {
    if (progress >= STAGE_AT[i]) index = i;
  }
  return index;
}

export function LandingPage() {
  const { t, i18n } = useTranslation("landing");
  const [scrollRatio, setScrollRatio] = useState(0);
  const [isSolid, setIsSolid] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [menuOpen, setMenuOpen] = useState(false);

  // Add landing-html & landing-body classes for ink background & Garamond typography
  useEffect(() => {
    document.documentElement.classList.add("landing-html");
    document.body.classList.add("landing-body");
    return () => {
      document.documentElement.classList.remove("landing-html");
      document.body.classList.remove("landing-body");
    };
  }, []);

  // Update title & description when language changes
  useEffect(() => {
    document.title = t("meta.title", "WordStreak — Khắc từng từ vào ký ức");
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute(
        "content",
        t(
          "meta.desc",
          "WordStreak dùng lặp lại ngắt quãng SM-2, phát âm IPA và chuỗi ngày học để biến vài phút mỗi ngày thành vốn từ ở lại lâu dài. Miễn phí trọn đời.",
        ),
      );
    }
  }, [i18n.language, t]);

  const readProgress = useCallback(() => {
    const prologue = document.querySelector<HTMLElement>(".prologue");
    if (!prologue) return 0;
    const total = prologue.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    const top = prologue.getBoundingClientRect().top;
    return clamp(-top / total, 0, 1);
  }, []);

  const scrollToProgress = useCallback((fraction: number) => {
    const prologue = document.querySelector<HTMLElement>(".prologue");
    if (!prologue) return;
    const total = prologue.offsetHeight - window.innerHeight;
    const top =
      window.scrollY + prologue.getBoundingClientRect().top + fraction * Math.max(total, 0);
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY || window.pageYOffset || 0;
      setIsSolid(scrolled > 40);

      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = total > 0 ? clamp(scrolled / total, 0, 1) : 0;
      setScrollRatio(ratio);

      const p = readProgress();
      setProgress(p);
      setActiveStage(stageFor(p));
    };

    const handleResize = () => {
      handleScroll();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // Initial sync
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [readProgress]);

  const handleOpenAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <div className="landing-page-root">
      <a className="skip-link" href="#main">
        {t("skip", "Bỏ qua điều hướng")}
      </a>

      {/* Top horizontal progress bar */}
      <div className="scroll-progress" aria-hidden="true">
        <span style={{ width: `${(scrollRatio * 100).toFixed(2)}%` }} />
      </div>

      {/* Sticky Header */}
      <Navbar
        isSolid={isSolid}
        onScrollToProgress={scrollToProgress}
        onOpenAuth={handleOpenAuth}
        onOpenMenu={() => setMenuOpen(true)}
      />

      <main id="main">
        {/* Prologue 4-chapter narrative journey with SVG scene */}
        <PrologueSection
          progress={progress}
          activeStage={activeStage}
          onScrollToProgress={scrollToProgress}
          onOpenAuth={handleOpenAuth}
        />

        {/* Pricing Section */}
        <PricingSection onOpenAuth={handleOpenAuth} />

        {/* FAQ Section */}
        <FAQSection />

        {/* Finale Call to Action */}
        <FinaleSection onOpenAuth={handleOpenAuth} />
      </main>

      {/* Footer */}
      <Footer
        onScrollToProgress={scrollToProgress}
        onOpenAuth={handleOpenAuth}
      />

      {/* Auth Modal Dialog */}
      <AuthDialog
        isOpen={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <MenuDialog
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onScrollToProgress={scrollToProgress}
        onOpenAuth={handleOpenAuth}
      />
    </div>
  );
}
