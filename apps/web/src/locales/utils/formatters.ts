import type {
  SupportedLocale,
  CanonicalLocaleTag,
  LocaleNumberFormatOptions,
  LocaleDateFormatOptions,
  RelativeTimeUnit,
} from "../types";

/**
 * Maps supported ISO locale code to canonical BCP-47 tag (BR-I18N-001)
 */
export function toCanonicalTag(
  locale: SupportedLocale = "en",
): CanonicalLocaleTag {
  return locale === "vi" ? "vi-VN" : "en-US";
}

/**
 * Locale-aware number formatter (BR-I18N-004)
 * vi-VN: 10.000,5
 * en-US: 10,000.5
 */
export function formatNumber(
  value: number,
  locale: SupportedLocale = "en",
  options?: LocaleNumberFormatOptions,
): string {
  if (isNaN(value) || !isFinite(value)) {
    return "0";
  }
  const tag = toCanonicalTag(locale);
  return new Intl.NumberFormat(tag, options).format(value);
}

/**
 * Locale-aware XP value formatter
 * vi-VN: "10.000 XP"
 * en-US: "10,000 XP"
 */
export function formatXp(
  value: number,
  locale: SupportedLocale = "en",
): string {
  const formatted = formatNumber(value, locale);
  return `${formatted} XP`;
}

/**
 * Locale-aware percentage formatter
 * vi-VN: "95,5%"
 * en-US: "95.5%"
 */
export function formatPercent(
  value: number,
  locale: SupportedLocale = "en",
  options?: Intl.NumberFormatOptions,
): string {
  if (isNaN(value) || !isFinite(value)) {
    return "0%";
  }
  const tag = toCanonicalTag(locale);
  const defaultOptions: Intl.NumberFormatOptions = {
    style: "percent",
    maximumFractionDigits: 1,
    ...options,
  };
  // If value is passed as percentage integer (e.g. 95.5 instead of 0.955)
  const normalizedValue = value > 1 || value < -1 ? value / 100 : value;
  return new Intl.NumberFormat(tag, defaultOptions).format(normalizedValue);
}

/**
 * Locale-aware date and time formatter (BR-I18N-005)
 */
export function formatDate(
  date: Date | string | number,
  locale: SupportedLocale = "en",
  options?: LocaleDateFormatOptions,
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) {
    return "";
  }

  const tag = toCanonicalTag(locale);

  if (options?.preset) {
    switch (options.preset) {
      case "short":
        return new Intl.DateTimeFormat(tag, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(d);
      case "medium":
        return new Intl.DateTimeFormat(tag, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(d);
      case "long":
        return new Intl.DateTimeFormat(tag, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(d);
      case "timeOnly":
        return new Intl.DateTimeFormat(tag, {
          hour: "2-digit",
          minute: "2-digit",
        }).format(d);
      case "dateTime":
        return new Intl.DateTimeFormat(tag, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(d);
    }
  }

  const defaultOptions: Intl.DateTimeFormatOptions = options || {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  return new Intl.DateTimeFormat(tag, defaultOptions).format(d);
}

/**
 * Locale-aware relative time formatter (BR-I18N-005)
 * Examples: "2 giờ trước" / "2 hours ago", "hôm qua" / "yesterday"
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: SupportedLocale = "en",
  baseDate: Date = new Date(),
): string {
  const target = date instanceof Date ? date : new Date(date);
  if (isNaN(target.getTime())) {
    return "";
  }

  const tag = toCanonicalTag(locale);
  const diffInSeconds = Math.round(
    (target.getTime() - baseDate.getTime()) / 1000,
  );
  const absSeconds = Math.abs(diffInSeconds);

  const units: { unit: RelativeTimeUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  const matched = units.find((u) => absSeconds >= u.seconds) || {
    unit: "second" as RelativeTimeUnit,
    seconds: 1,
  };

  const value = Math.round(diffInSeconds / matched.seconds);
  const rtf = new Intl.RelativeTimeFormat(tag, { numeric: "auto" });

  return rtf.format(value, matched.unit);
}
