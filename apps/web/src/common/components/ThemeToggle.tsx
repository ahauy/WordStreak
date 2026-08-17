import React from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../store/useThemeStore";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-all duration-150 border cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] apple-tap-active ${
        isDark
          ? "bg-[#272729] text-[#f5f5f7] hover:bg-[#333336] border-white/10"
          : "bg-white text-[#1d1d1f] hover:bg-[#f0f0f2] border-[#e0e0e0]"
      } ${className}`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <div className="w-4 h-4 flex items-center justify-center">
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </div>
    </button>
  );
};
