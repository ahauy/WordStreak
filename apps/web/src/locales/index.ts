import commonEn from "./en/common.json";
import authEn from "./en/auth.json";
import dashboardEn from "./en/dashboard.json";
import decksEn from "./en/decks.json";
import cardsEn from "./en/cards.json";
import studyEn from "./en/study.json";
import practiceEn from "./en/practice.json";
import communityEn from "./en/community.json";
import analyticsEn from "./en/analytics.json";
import settingsEn from "./en/settings.json";
import gamificationEn from "./en/gamification.json";
import aiVocabularyEn from "./en/ai_vocabulary.json";
import errorsEn from "./en/errors.json";

import commonVi from "./vi/common.json";
import authVi from "./vi/auth.json";
import dashboardVi from "./vi/dashboard.json";
import decksVi from "./vi/decks.json";
import cardsVi from "./vi/cards.json";
import studyVi from "./vi/study.json";
import practiceVi from "./vi/practice.json";
import communityVi from "./vi/community.json";
import analyticsVi from "./vi/analytics.json";
import settingsVi from "./vi/settings.json";
import gamificationVi from "./vi/gamification.json";
import aiVocabularyVi from "./vi/ai_vocabulary.json";
import errorsVi from "./vi/errors.json";

export const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    dashboard: dashboardEn,
    decks: decksEn,
    cards: cardsEn,
    study: studyEn,
    practice: practiceEn,
    community: communityEn,
    analytics: analyticsEn,
    settings: settingsEn,
    gamification: gamificationEn,
    ai_vocabulary: aiVocabularyEn,
    errors: errorsEn,
  },
  vi: {
    common: commonVi,
    auth: authVi,
    dashboard: dashboardVi,
    decks: decksVi,
    cards: cardsVi,
    study: studyVi,
    practice: practiceVi,
    community: communityVi,
    analytics: analyticsVi,
    settings: settingsVi,
    gamification: gamificationVi,
    ai_vocabulary: aiVocabularyVi,
    errors: errorsVi,
  },
} as const;

export * from "./constants";
export * from "./types";
export * from "./utils/storage";
export * from "./utils/formatters";
export * from "./utils/errorMapper";
export * from "./hooks/useLocaleFormat";
export { default as i18n } from "./i18n";
