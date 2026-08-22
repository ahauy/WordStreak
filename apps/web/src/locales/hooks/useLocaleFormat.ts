import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type {
  SupportedLocale,
  CanonicalLocaleTag,
  LocaleNumberFormatOptions,
  LocaleDateFormatOptions,
} from "../types";
import {
  toCanonicalTag,
  formatNumber as formatNumberUtil,
  formatXp as formatXpUtil,
  formatPercent as formatPercentUtil,
  formatDate as formatDateUtil,
  formatRelativeTime as formatRelativeTimeUtil,
} from "../utils/formatters";

/**
 * Reactive custom hook for locale-aware number, XP, date, and relative time formatting.
 */
export function useLocaleFormat() {
  const { i18n } = useTranslation();

  const activeLocale = useMemo<SupportedLocale>(() => {
    const raw = i18n.resolvedLanguage || i18n.language || "en";
    return raw.startsWith("vi") ? "vi" : "en";
  }, [i18n.resolvedLanguage, i18n.language]);

  const canonicalTag = useMemo<CanonicalLocaleTag>(() => {
    return toCanonicalTag(activeLocale);
  }, [activeLocale]);

  const formatNumber = useCallback(
    (value: number, options?: LocaleNumberFormatOptions) => {
      return formatNumberUtil(value, activeLocale, options);
    },
    [activeLocale],
  );

  const formatXp = useCallback(
    (xp: number) => {
      return formatXpUtil(xp, activeLocale);
    },
    [activeLocale],
  );

  const formatPercent = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => {
      return formatPercentUtil(value, activeLocale, options);
    },
    [activeLocale],
  );

  const formatDate = useCallback(
    (date: Date | string | number, options?: LocaleDateFormatOptions) => {
      return formatDateUtil(date, activeLocale, options);
    },
    [activeLocale],
  );

  const formatRelativeTime = useCallback(
    (date: Date | string | number, baseDate?: Date) => {
      return formatRelativeTimeUtil(date, activeLocale, baseDate);
    },
    [activeLocale],
  );

  return {
    activeLocale,
    canonicalTag,
    formatNumber,
    formatXp,
    formatPercent,
    formatDate,
    formatRelativeTime,
  };
}
