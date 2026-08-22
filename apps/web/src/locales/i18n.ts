import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { resources } from "./index";
import { STORAGE_KEY, DEFAULT_LOCALE, DEFAULT_NAMESPACE } from "./constants";
import { safeGetLocale, safeSetLocale } from "./utils/storage";

const languageDetector = new LanguageDetector();
languageDetector.addDetector({
  name: "wordstreakStorageDetector",
  lookup() {
    return safeGetLocale() || undefined;
  },
  cacheUserLanguage(lng: string) {
    if (lng === "vi" || lng === "en") {
      safeSetLocale(lng);
    }
  },
});

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: DEFAULT_NAMESPACE,
    ns: [
      "common",
      "auth",
      "dashboard",
      "decks",
      "cards",
      "study",
      "practice",
      "community",
      "analytics",
      "settings",
      "gamification",
      "ai_vocabulary",
      "errors",
    ],
    supportedLngs: ["vi", "en"],
    load: "languageOnly",
    detection: {
      order: ["wordstreakStorageDetector", "localStorage", "navigator"],
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
