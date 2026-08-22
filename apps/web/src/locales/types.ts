import "i18next";
import common from "./en/common.json";
import auth from "./en/auth.json";
import dashboard from "./en/dashboard.json";
import decks from "./en/decks.json";
import study from "./en/study.json";
import practice from "./en/practice.json";
import community from "./en/community.json";
import analytics from "./en/analytics.json";
import settings from "./en/settings.json";

export type SupportedLocale = "vi" | "en";

export interface LocaleMetadata {
  code: SupportedLocale;
  label: "VI" | "EN";
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr";
}

export type DomainNamespace =
  | "common"
  | "auth"
  | "dashboard"
  | "decks"
  | "study"
  | "practice"
  | "community"
  | "analytics"
  | "settings";

export interface TranslationResources {
  common: typeof common;
  auth: typeof auth;
  dashboard: typeof dashboard;
  decks: typeof decks;
  study: typeof study;
  practice: typeof practice;
  community: typeof community;
  analytics: typeof analytics;
  settings: typeof settings;
}

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: TranslationResources;
  }
}
