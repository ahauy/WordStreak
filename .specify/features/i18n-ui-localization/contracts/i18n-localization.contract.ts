/**
 * Localization & Formatting Type Contracts: Complete UI Localization & Error Mapping (US-I18N-02)
 * Feature: i18n-ui-localization
 */

export type SupportedLocale = "vi" | "en";
export type CanonicalLocaleTag = "vi-VN" | "en-US";

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

export interface LocaleMetadata {
  code: SupportedLocale;
  label: "VI" | "EN";
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr";
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
