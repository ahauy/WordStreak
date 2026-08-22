import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  safeGetLocale,
  safeSetLocale,
  safeRemoveLocale,
  validateStoredLocale,
} from "../storage";
import { STORAGE_KEY } from "../../constants";

describe("Locale Storage Utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("validateStoredLocale", () => {
    it('returns "vi" for valid "vi" string', () => {
      expect(validateStoredLocale("vi")).toBe("vi");
    });

    it('returns "en" for valid "en" string', () => {
      expect(validateStoredLocale("en")).toBe("en");
    });

    it("returns null for unsupported or invalid language strings", () => {
      expect(validateStoredLocale("de")).toBeNull();
      expect(validateStoredLocale("fr")).toBeNull();
      expect(validateStoredLocale("null")).toBeNull();
      expect(validateStoredLocale(null)).toBeNull();
      expect(validateStoredLocale(undefined)).toBeNull();
      expect(validateStoredLocale(123)).toBeNull();
      expect(validateStoredLocale({})).toBeNull();
    });
  });

  describe("safeGetLocale", () => {
    it("returns null when storage is empty", () => {
      expect(safeGetLocale()).toBeNull();
    });

    it("returns valid locale when correctly stored in localStorage", () => {
      localStorage.setItem(STORAGE_KEY, "vi");
      expect(safeGetLocale()).toBe("vi");

      localStorage.setItem(STORAGE_KEY, "en");
      expect(safeGetLocale()).toBe("en");
    });

    it("returns null and discards invalid values stored in localStorage", () => {
      localStorage.setItem(STORAGE_KEY, "invalid-lang");
      expect(safeGetLocale()).toBeNull();
    });

    it("handles localStorage.getItem throwing an exception gracefully", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementationOnce(() => {
        throw new DOMException("Access denied", "SecurityError");
      });

      expect(safeGetLocale()).toBeNull();
    });
  });

  describe("safeSetLocale", () => {
    it("persists valid locale to localStorage and returns true", () => {
      const result = safeSetLocale("vi");
      expect(result).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBe("vi");
    });

    it("returns false for invalid locale value without writing", () => {
      // @ts-expect-error Testing invalid runtime value
      const result = safeSetLocale("invalid");
      expect(result).toBe(false);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("handles localStorage.setItem throwing SecurityError gracefully", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
        throw new DOMException("Storage full or blocked", "QuotaExceededError");
      });

      const result = safeSetLocale("en");
      expect(result).toBe(false);
    });
  });

  describe("safeRemoveLocale", () => {
    it("removes stored locale and returns true", () => {
      localStorage.setItem(STORAGE_KEY, "vi");
      const result = safeRemoveLocale();
      expect(result).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("handles localStorage.removeItem throwing an error gracefully", () => {
      vi.spyOn(Storage.prototype, "removeItem").mockImplementationOnce(() => {
        throw new DOMException("Access denied", "SecurityError");
      });

      const result = safeRemoveLocale();
      expect(result).toBe(false);
    });
  });
});
