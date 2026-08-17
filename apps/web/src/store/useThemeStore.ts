import { create } from "zustand";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const THEME_STORAGE_KEY = "wordstreak_theme";

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark",
  resolvedTheme: "dark",

  setTheme: (theme: Theme) => {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }

    set({ theme, resolvedTheme: resolved });
  },

  toggleTheme: () => {
    const { resolvedTheme } = get();
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    get().setTheme(nextTheme);
  },

  initializeTheme: () => {
    const savedTheme =
      (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || "dark";
    const resolved = savedTheme === "system" ? getSystemTheme() : savedTheme;

    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }

    set({ theme: savedTheme, resolvedTheme: resolved });

    // Listen for system theme changes if set to system
    if (typeof window !== "undefined") {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          if (get().theme === "system") {
            const newResolved = e.matches ? "dark" : "light";
            if (newResolved === "dark") {
              document.documentElement.classList.add("dark");
              document.documentElement.classList.remove("light");
            } else {
              document.documentElement.classList.add("light");
              document.documentElement.classList.remove("dark");
            }
            set({ resolvedTheme: newResolved });
          }
        });
    }
  },
}));
