import { Link } from "react-router-dom";
import { PurpleStreakFlame } from "./PurpleStreakFlame";
import { Globe, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t, i18n } = useTranslation("landing");

  return (
    <footer className="border-t border-[#e5e5e5] bg-white py-14 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#e5e5e5]">
          {/* Column 1: Brand & Manifesto (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <PurpleStreakFlame size="sm" showEmbers={false} />
              <span
                className="text-lg font-bold tracking-tight text-black"
                style={{ fontFamily: "var(--font-display)" }}
              >
                WordStreak
              </span>
            </div>

            <p className="body-sm text-[#737373] max-w-sm leading-relaxed">
              {t(
                "footer.manifesto",
                "Open-source, spaced repetition English vocabulary platform. Designed to help language learners achieve permanent memory retention without paywalls.",
              )}
            </p>

            {/* Live Operational Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-xs font-mono text-[#525252]">
              <span className="flex h-2 w-2 rounded-full bg-[#27c93f] animate-pulse" />
              <span>
                {t("footer.status", "All Systems Operational · 100% Free")}
              </span>
            </div>
          </div>

          {/* Column 2: Core Learning Engine */}
          <div className="space-y-3">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-black">
              {t("footer.engineTitle", "Learning Engine")}
            </p>
            <ul className="space-y-2 text-xs text-[#737373]">
              <li>
                <a
                  href="#interactive-demo"
                  className="hover:text-black transition-colors"
                >
                  {t("footer.srsEngine", "SM-2 Spaced Repetition")}
                </a>
              </li>
              <li>
                <a
                  href="#interactive-demo"
                  className="hover:text-black transition-colors"
                >
                  {t("footer.contextCards", "Contextual Flashcards")}
                </a>
              </li>
              <li>
                <a
                  href="#interactive-demo"
                  className="hover:text-black transition-colors"
                >
                  {t("footer.audioIpa", "Audio IPA Pronunciation")}
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-black transition-colors"
                >
                  {t("footer.activeRecall", "Active Recall Quizzes")}
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-black transition-colors"
                >
                  {t("footer.streakFreeze", "Streak Freeze Protection")}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Study Pathways */}
          <div className="space-y-3">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-black">
              {t("footer.pathwaysTitle", "Study Pathways")}
            </p>
            <ul className="space-y-2 text-xs text-[#737373]">
              <li>
                <a
                  href="#study-modes"
                  className="hover:text-black transition-colors"
                >
                  {t("footer.pathIelts", "IELTS & TOEFL Prep")}
                </a>
              </li>
              <li>
                <a
                  href="#study-modes"
                  className="hover:text-black transition-colors"
                >
                  {t("footer.pathConvo", "Conversational Fluency")}
                </a>
              </li>
              <li>
                <a
                  href="#study-modes"
                  className="hover:text-black transition-colors"
                >
                  {t("footer.pathBusiness", "Business & Tech English")}
                </a>
              </li>
              <li>
                <a
                  href="#study-modes"
                  className="hover:text-black transition-colors"
                >
                  {t("footer.pathCustom", "Custom Reading Decks")}
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-black transition-colors"
                >
                  {t("footer.aiLookup", "Instant AI Card Lookup")}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Open & Data Ownership */}
          <div className="space-y-3">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-black">
              {t("footer.openTitle", "Open & Local-First")}
            </p>
            <ul className="space-y-2 text-xs text-[#737373]">
              <li>
                <span className="text-[#525252] font-medium">
                  {t("footer.ankiExport", "Anki (.apkg) Export")}
                </span>
              </li>
              <li>
                <span className="text-[#525252] font-medium">
                  {t("footer.csvExport", "CSV & JSON Export")}
                </span>
              </li>
              <li>
                <span className="text-[#525252] font-medium">
                  {t("footer.offlineStorage", "Offline Local Storage")}
                </span>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-black transition-colors"
                >
                  {t("footer.signIn", "Sign In to Account")}
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-black transition-colors font-semibold text-black"
                >
                  {t("footer.createFree", "Create Free Account →")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a3a3a3]">
          <p className="flex flex-wrap items-center justify-center gap-1.5 text-center">
            <span>
              © {new Date().getFullYear()} WordStreak.{" "}
              {t("footer.copyright", "Built with")}
            </span>
            <Heart className="h-3.5 w-3.5 fill-[#9333ea] text-[#9333ea] shrink-0" />
            <span>
              {t("footer.copyrightSuffix", "for language learners worldwide.")}
            </span>
          </p>

          <div className="flex items-center gap-5">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-black transition-colors"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub</span>
            </a>
            <span className="hover:text-black transition-colors flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              <span>{i18n.language === "vi" ? "VI (VN)" : "EN (US)"}</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
