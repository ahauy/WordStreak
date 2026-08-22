/**
 * Locale & Storage Contract for WordStreak Internationalization Infrastructure
 * Feature: US-I18N-01 (Core i18n Infrastructure & Instant Language Switcher)
 */

export type SupportedLocale = "vi" | "en";

export interface LocaleMetadata {
  code: SupportedLocale;
  label: "VI" | "EN";
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr";
}

export const SUPPORTED_LOCALES: Record<SupportedLocale, LocaleMetadata> = {
  vi: {
    code: "vi",
    label: "VI",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    flag: "🇻🇳",
    dir: "ltr",
  },
  en: {
    code: "en",
    label: "EN",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    dir: "ltr",
  },
};

export const DEFAULT_LOCALE: SupportedLocale = "en";
export const STORAGE_KEY = "wordstreak_locale" as const;

export interface SafeLocaleStorage {
  get(): SupportedLocale | null;
  set(locale: SupportedLocale): boolean;
  remove(): boolean;
}

export interface LanguageSwitcherProps {
  className?: string;
  variant?: "obsidian" | "compact";
  onLocaleChange?: (locale: SupportedLocale) => void;
  ariaLabel?: string;
}
