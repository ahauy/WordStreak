import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { RegisterForm } from "../components/RegisterForm";
import { AuthShowcase } from "../components/AuthShowcase";
import { PageTransition } from "../../../common/components/layout/PageTransition";
import { ArrowLeft, Globe } from "lucide-react";
import { PurpleStreakFlame } from "../../landing/components/PurpleStreakFlame";
import { useTranslation } from "react-i18next";

export const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation(["auth", "common"]);
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-white text-black flex flex-col justify-between selection:bg-[#f3e8ff] selection:text-[#7e22ce]">
        {/* Main Content Layer */}
        <div className="flex min-h-screen flex-col justify-between">
          {/* Top Header Bar */}
          <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-6 px-4 sm:px-6 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-black hover:opacity-80 transition-opacity"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <PurpleStreakFlame size="sm" showEmbers={false} />
              <span className="font-extrabold tracking-tight">WordStreak</span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-[#f3e8ff] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#7e22ce] border border-[#e9d5ff]">
                100% Free
              </span>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-[#fafafa] hover:bg-[#f0f0f0] hover:border-[#d4d4d4] px-4 py-2 text-xs font-medium text-black transition-all cursor-pointer apple-tap-active"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t("common:actions.backToHome", "Back to Home")}</span>
            </Link>
          </header>

          {/* Main Split Layout Container */}
          <main className="flex-1 flex items-center justify-center w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-center justify-items-center gap-8 lg:gap-14">
              {/* Left Column: Product Value Showcase (Hidden on Mobile) */}
              <AuthShowcase />

              {/* Right Column: Register Form Card */}
              <div className="w-full flex justify-center">
                <RegisterForm
                  onSuccess={() => navigate("/dashboard", { replace: true })}
                  onNavigateToLogin={() => navigate("/login")}
                />
              </div>
            </div>
          </main>

          {/* Minimalist Footer */}
          <footer className="w-full max-w-6xl mx-auto text-xs text-[#a3a3a3] py-6 px-4 sm:px-6 border-t border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <p>
              © {new Date().getFullYear()} WordStreak. 100% Free & Open-Source.
            </p>
            <div className="flex items-center gap-5">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-black transition-colors"
              >
                {t("auth:register.privacyLink", "Privacy Policy")}
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-black transition-colors"
              >
                {t("auth:register.termsLink", "Terms of Service")}
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors"
              >
                GitHub
              </a>
              <span className="flex items-center gap-1 text-[#737373]">
                <Globe className="w-3.5 h-3.5" />
                <span>{i18n.language === "vi" ? "VI (VN)" : "EN (US)"}</span>
              </span>
            </div>
          </footer>
        </div>
      </div>
    </PageTransition>
  );
};
