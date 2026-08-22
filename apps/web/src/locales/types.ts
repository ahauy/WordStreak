import "i18next";
import common from "./en/common.json";
import auth from "./en/auth.json";
import dashboard from "./en/dashboard.json";
import decks from "./en/decks.json";
import cards from "./en/cards.json";
import study from "./en/study.json";
import practice from "./en/practice.json";
import community from "./en/community.json";
import analytics from "./en/analytics.json";
import settings from "./en/settings.json";
import gamification from "./en/gamification.json";
import ai_vocabulary from "./en/ai_vocabulary.json";
import errors from "./en/errors.json";

export type SupportedLocale = "vi" | "en";
export type CanonicalLocaleTag = "vi-VN" | "en-US";

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
  | "cards"
  | "study"
  | "practice"
  | "community"
  | "analytics"
  | "settings"
  | "gamification"
  | "ai_vocabulary"
  | "errors";

export interface TranslationResources {
  common: typeof common;
  auth: typeof auth;
  dashboard: typeof dashboard;
  decks: typeof decks;
  cards: typeof cards;
  study: typeof study;
  practice: typeof practice;
  community: typeof community;
  analytics: typeof analytics;
  settings: typeof settings;
  gamification: typeof gamification;
  ai_vocabulary: typeof ai_vocabulary;
  errors: typeof errors;
}

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: TranslationResources;
  }
}

export type ErrorCodeKey =
  | "AUTH_INVALID_CREDENTIALS"
  | "AUTH_EMAIL_ALREADY_EXISTS"
  | "AUTH_UNAUTHORIZED"
  | "AUTH_FORBIDDEN"
  | "AUTH_ACCOUNT_LOCKED"
  | "AUTH_INVALID_TOKEN"
  | "AUTH_TOKEN_EXPIRED"
  | "DECK_NOT_FOUND"
  | "DECK_TITLE_REQUIRED"
  | "DECK_PERMISSION_DENIED"
  | "CARD_NOT_FOUND"
  | "CARD_LIMIT_EXCEEDED"
  | "PRACTICE_NO_CARDS_DUE"
  | "PRACTICE_SESSION_EXPIRED"
  | "AI_GENERATION_FAILED"
  | "AI_QUOTA_EXCEEDED"
  | "AI_WORD_NOT_FOUND"
  | "RATE_LIMIT_EXCEEDED"
  | "NETWORK_ERROR"
  | "UNEXPECTED_ERROR";

export interface ErrorRegistryEntry {
  namespace: string;
  keyPath: string;
  fallbackMessage: string;
}

export interface LocaleNumberFormatOptions extends Intl.NumberFormatOptions {
  compact?: boolean;
}

export interface LocaleDateFormatOptions extends Intl.DateTimeFormatOptions {
  preset?: "short" | "medium" | "long" | "timeOnly" | "dateTime";
}

export type RelativeTimeUnit =
  "year" | "quarter" | "month" | "week" | "day" | "hour" | "minute" | "second";

export interface SrsRatingOption {
  rating: 1 | 2 | 3 | 4;
  key: "again" | "hard" | "good" | "easy";
  label: string;
  intervalText: string;
  shortcut: string;
}
