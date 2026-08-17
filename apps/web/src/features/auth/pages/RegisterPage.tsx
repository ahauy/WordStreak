import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { RegisterForm } from "../components/RegisterForm";
import { AuthShowcase } from "../components/AuthShowcase";
import { ThemeToggle } from "../../../common/components/ThemeToggle";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#161617] text-[#1d1d1f] dark:text-[#f5f5f7] flex flex-col justify-between px-4 sm:px-6">
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-4 sm:py-5 shrink-0">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-[#1d1d1f] dark:text-white hover:opacity-80 transition-opacity"
        >
          <span className="w-7 h-7 rounded-lg bg-[#1d1d1f] dark:bg-white flex items-center justify-center text-white dark:text-[#1d1d1f] text-xs font-bold">
            W
          </span>
          <span>WordStreak</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Split Layout Container - Perfectly Vertically Centered */}
      <main className="flex-1 flex items-center justify-center w-full max-w-6xl mx-auto py-4 sm:py-6">
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

      {/* Apple Minimalist Footer */}
      <footer className="w-full max-w-6xl mx-auto text-center text-xs text-[#86868b] py-4 border-t border-[#e0e0e0] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <p>
          Copyright © {new Date().getFullYear()} WordStreak. All rights
          reserved.
        </p>
        <div className="flex items-center gap-5">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
          >
            Support
          </a>
        </div>
      </footer>
    </div>
  );
};
