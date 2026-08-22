import commonEn from "./en/common.json";
import authEn from "./en/auth.json";
import dashboardEn from "./en/dashboard.json";
import decksEn from "./en/decks.json";
import studyEn from "./en/study.json";
import practiceEn from "./en/practice.json";
import communityEn from "./en/community.json";
import analyticsEn from "./en/analytics.json";
import settingsEn from "./en/settings.json";

import commonVi from "./vi/common.json";
import authVi from "./vi/auth.json";
import dashboardVi from "./vi/dashboard.json";
import decksVi from "./vi/decks.json";
import studyVi from "./vi/study.json";
import practiceVi from "./vi/practice.json";
import communityVi from "./vi/community.json";
import analyticsVi from "./vi/analytics.json";
import settingsVi from "./vi/settings.json";

export const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    dashboard: dashboardEn,
    decks: decksEn,
    study: studyEn,
    practice: practiceEn,
    community: communityEn,
    analytics: analyticsEn,
    settings: settingsEn,
  },
  vi: {
    common: commonVi,
    auth: authVi,
    dashboard: dashboardVi,
    decks: decksVi,
    study: studyVi,
    practice: practiceVi,
    community: communityVi,
    analytics: analyticsVi,
    settings: settingsVi,
  },
} as const;

export * from "./constants";
export * from "./types";
export * from "./utils/storage";
export { default as i18n } from "./i18n";
