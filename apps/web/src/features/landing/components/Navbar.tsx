import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "navbar-scrolled" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 sm:py-5">
        {/* Logo */}
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

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          <button
            onClick={() => scrollTo("features")}
            className="cursor-pointer text-sm font-medium text-[#cbd5e1] transition-colors hover:text-white"
          >
            Features
          </button>
          <button
            onClick={() => scrollTo("how-it-works")}
            className="cursor-pointer text-sm font-medium text-[#cbd5e1] transition-colors hover:text-white"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo("stats")}
            className="cursor-pointer text-sm font-medium text-[#cbd5e1] transition-colors hover:text-white"
          >
            Why WordStreak
          </button>
          <Link
            to="/login"
            className="text-sm font-medium text-[#cbd5e1] hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="cursor-pointer rounded-full bg-[#f5a623] px-6 py-2.5 text-sm font-bold text-[#060e1a] shadow-md shadow-[#f5a623]/20 transition-all hover:scale-105 hover:bg-[#ffb940] active:scale-95"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-1.5 md:hidden p-2 rounded-lg bg-white/5"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 bg-white transition-transform duration-200 ${
              mobileOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white transition-opacity duration-200 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white transition-transform duration-200 ${
              mobileOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-white/10 bg-[#060e1a]/95 px-6 pb-6 pt-4 backdrop-blur-2xl md:hidden">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => scrollTo("features")}
              className="text-left text-sm font-medium text-[#cbd5e1] hover:text-white"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="text-left text-sm font-medium text-[#cbd5e1] hover:text-white"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("stats")}
              className="text-left text-sm font-medium text-[#cbd5e1] hover:text-white"
            >
              Why WordStreak
            </button>
            <Link
              to="/login"
              className="text-sm font-medium text-[#cbd5e1] hover:text-white"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="mt-2 rounded-full bg-[#f5a623] px-6 py-3 text-center text-sm font-bold text-[#060e1a]"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
