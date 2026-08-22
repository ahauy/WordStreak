import { STORAGE_KEY } from "../constants";
import type { SupportedLocale } from "../types";

/**
 * Validates whether an unknown value is a supported ISO locale ('vi' | 'en')
 */
export function validateStoredLocale(raw: unknown): SupportedLocale | null {
  if (raw === "vi" || raw === "en") {
    return raw;
  }
  return null;
}

/**
 * Safely retrieves the stored locale from localStorage.
 * Returns null if storage is inaccessible or value is invalid.
 */
export function safeGetLocale(): SupportedLocale | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return validateStoredLocale(raw);
  } catch (error) {
    console.warn("[i18n] Failed to read locale from localStorage:", error);
    return null;
  }
}

/**
 * Safely saves the selected locale to localStorage.
 * Suppresses DOMExceptions (e.g. Incognito / QuotaExceeded) and returns false on failure.
 */
export function safeSetLocale(locale: SupportedLocale): boolean {
  try {
    const validated = validateStoredLocale(locale);
    if (!validated) {
      return false;
    }
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }
    window.localStorage.setItem(STORAGE_KEY, validated);
    return true;
  } catch (error) {
    console.warn("[i18n] Failed to save locale to localStorage:", error);
    return false;
  }
}

/**
 * Safely removes the stored locale from localStorage.
 */
export function safeRemoveLocale(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn("[i18n] Failed to remove locale from localStorage:", error);
    return false;
  }
}
