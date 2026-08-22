import type { SupportedLocale } from "../../locales/types";

export interface LanguageSwitcherProps {
  /** Optional custom CSS classes applied to the outer container */
  className?: string;
  /** UI style variant: 'subtle' (default white pill with black border), 'obsidian' (solid black), or 'compact' */
  variant?: "subtle" | "obsidian" | "compact";
  /** Optional callback invoked immediately after language toggle */
  onLocaleChange?: (locale: SupportedLocale) => void;
  /** Optional custom accessibility label override */
  ariaLabel?: string;
}
