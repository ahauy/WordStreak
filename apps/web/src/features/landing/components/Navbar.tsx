import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { PurpleStreakFlame } from "./PurpleStreakFlame";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";

export function Navbar() {
  const { t } = useTranslation("common");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-[#e5e5e5] shadow-xs"
          : "bg-white"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Flame */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-black transition-opacity hover:opacity-85 shrink-0"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <PurpleStreakFlame size="sm" showEmbers={false} />
            <span className="font-extrabold tracking-tight">WordStreak</span>
            <span className="hidden sm:inline-flex items-center rounded-full bg-[#f3e8ff] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#7e22ce] border border-[#e9d5ff] whitespace-nowrap shrink-0">
              {t("brand.badgeFree", "100% Free")}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-4 xl:gap-5 text-xs font-medium text-[#737373]">
            <button
              onClick={() => scrollToSection("interactive-demo")}
              className="cursor-pointer transition-colors hover:text-black py-1 whitespace-nowrap"
            >
              {t("nav.interactiveDemo", "Interactive Demo")}
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="cursor-pointer transition-colors hover:text-black py-1 whitespace-nowrap"
            >
              {t("nav.features", "Features")}
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="cursor-pointer transition-colors hover:text-black py-1 whitespace-nowrap"
            >
              {t("nav.howItWorks", "How It Works")}
            </button>
            <button
              onClick={() => scrollToSection("study-modes")}
              className="cursor-pointer transition-colors hover:text-black py-1 whitespace-nowrap"
            >
              {t("nav.studyGoals", "Study Goals")}
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="cursor-pointer transition-colors hover:text-black py-1 whitespace-nowrap"
            >
              {t("nav.faq", "FAQ")}
            </button>
          </nav>
        </div>

        {/* Center Search Pill with Command Hint */}
        <div className="hidden xl:flex flex-1 max-w-xs mx-4">
          <div className="search-pill-input w-full justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-3.5 w-3.5 text-[#a3a3a3] shrink-0" />
              <input
                type="text"
                placeholder={t("nav.searchPlaceholder", "Search vocabulary...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-black placeholder-[#a3a3a3] focus:outline-none"
              />
            </div>
            <kbd className="hidden sm:inline-block rounded-md border border-[#e5e5e5] bg-white px-1.5 py-0.5 text-[10px] font-mono text-[#a3a3a3]">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="hidden md:flex items-center gap-2.5 lg:gap-3 shrink-0">
          <LanguageSwitcher />
          <Link
            to="/login"
            className="text-xs font-medium text-black px-3 py-1.5 transition-opacity hover:opacity-70 whitespace-nowrap"
          >
            {t("actions.signIn", "Sign In")}
          </Link>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0"
          >
            <Link
              to="/register"
              className="btn-primary text-xs whitespace-nowrap shrink-0"
            >
              <Sparkles className="mr-1 h-3 w-3 shrink-0" />
              <span>{t("actions.signUp", "Start Free")}</span>
              <ArrowRight className="ml-1 h-3 w-3 shrink-0" />
            </Link>
          </motion.div>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-black md:hidden cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-[#e5e5e5] bg-white px-5 py-4 md:hidden overflow-hidden"
          >
            <div className="mb-4">
              <div className="search-pill-input w-full">
                <Search className="h-3.5 w-3.5 text-[#a3a3a3] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder={t(
                    "nav.searchPlaceholder",
                    "Search vocabulary...",
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-black placeholder-[#a3a3a3] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 text-sm font-medium text-black">
              <button
                onClick={() => scrollToSection("interactive-demo")}
                className="text-left py-1 text-[#737373] hover:text-black"
              >
                {t("nav.interactiveDemo", "Interactive Demo")}
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-left py-1 text-[#737373] hover:text-black"
              >
                {t("nav.features", "Features")}
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-left py-1 text-[#737373] hover:text-black"
              >
                {t("nav.howItWorks", "How It Works")}
              </button>
              <button
                onClick={() => scrollToSection("study-modes")}
                className="text-left py-1 text-[#737373] hover:text-black"
              >
                {t("nav.studyGoals", "Study Goals")}
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-left py-1 text-[#737373] hover:text-black"
              >
                {t("nav.faq", "FAQ")}
              </button>

              <div className="pt-3 border-t border-[#e5e5e5] flex flex-col gap-3">
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-[#737373] font-medium">
                    Ngôn ngữ / Language:
                  </span>
                  <LanguageSwitcher />
                </div>
                <Link
                  to="/login"
                  className="py-2 text-center text-sm font-medium text-black"
                >
                  {t("actions.signIn", "Sign In")}
                </Link>
                <Link to="/register" className="btn-primary w-full text-center">
                  {t("actions.startLearning", "Start Learning Free")}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
