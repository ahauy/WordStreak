import type { LocaleMetadata, SupportedLocale, DomainNamespace } from "./types";

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
export const DEFAULT_NAMESPACE: DomainNamespace = "common";
export const STORAGE_KEY = "wordstreak_locale" as const;
