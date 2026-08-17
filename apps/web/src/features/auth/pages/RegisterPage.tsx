import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { RegisterForm } from "../components/RegisterForm";
import { AuthShowcase } from "../components/AuthShowcase";
import { StarrySky } from "../../landing/components/StarrySky";
import { ArrowLeft, Sparkles } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen text-white flex flex-col justify-between px-4 sm:px-6 selection:bg-[#f5a623] selection:text-[#060e1a]"
      style={{ backgroundColor: "#060e1a" }}
    >
      {/* Living Starry Night Cosmos Background */}
      <StarrySky />

      {/* Main Content Layer */}
      <div className="relative z-10 flex min-h-screen flex-col justify-between">
        {/* Top Header Bar */}
        <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-6 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f5a623] text-[#060e1a] shadow-md shadow-[#f5a623]/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>WordStreak</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-[#cbd5e1] backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </header>

        {/* Main Split Layout Container */}
        <main className="flex-1 flex items-center justify-center w-full max-w-6xl mx-auto py-6">
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

        {/* Cosmos Minimalist Footer */}
        <footer className="w-full max-w-6xl mx-auto text-center text-xs text-[#94a3b8] py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p>
            Copyright © {new Date().getFullYear()} WordStreak. All rights
            reserved.
          </p>
          <div className="flex items-center gap-5">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="hover:text-white transition-colors"
            >
              Support
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};
