import { describe, it, expect } from "vitest";
import {
  toCanonicalTag,
  formatNumber,
  formatXp,
  formatPercent,
  formatDate,
  formatRelativeTime,
} from "../utils/formatters";

describe("Intl Formatting Utilities (BR-I18N-001, BR-I18N-004, BR-I18N-005)", () => {
  describe("toCanonicalTag", () => {
    it("maps 'vi' to canonical BCP-47 tag 'vi-VN'", () => {
      expect(toCanonicalTag("vi")).toBe("vi-VN");
    });

    it("maps 'en' to canonical BCP-47 tag 'en-US'", () => {
      expect(toCanonicalTag("en")).toBe("en-US");
    });
  });

  describe("formatNumber", () => {
    it("formats thousands and decimals in Vietnamese (vi-VN)", () => {
      const formatted = formatNumber(12450.5, "vi");
      // vi-VN format uses '.' for thousands and ',' for decimal
      expect(formatted).toBe("12.450,5");
    });

    it("formats thousands and decimals in English (en-US)", () => {
      const formatted = formatNumber(12450.5, "en");
      // en-US format uses ',' for thousands and '.' for decimal
      expect(formatted).toBe("12,450.5");
    });

    it("handles zero and negative numbers gracefully", () => {
      expect(formatNumber(0, "en")).toBe("0");
      expect(formatNumber(-5000, "en")).toBe("-5,000");
    });

    it("handles NaN and non-finite values safely", () => {
      expect(formatNumber(NaN, "en")).toBe("0");
      expect(formatNumber(Infinity, "en")).toBe("0");
    });
  });

  describe("formatXp", () => {
    it("formats XP with localized number and 'XP' suffix", () => {
      expect(formatXp(10000, "vi")).toBe("10.000 XP");
      expect(formatXp(10000, "en")).toBe("10,000 XP");
      expect(formatXp(50, "en")).toBe("50 XP");
    });
  });

  describe("formatPercent", () => {
    it("formats percentage in vi and en", () => {
      // 0.955 -> 95.5% in EN, 95,5% in VI
      expect(formatPercent(0.955, "en")).toBe("95.5%");
      expect(formatPercent(0.955, "vi")).toBe("95,5%");
    });

    it("normalizes integer percentage values > 1", () => {
      expect(formatPercent(95.5, "en")).toBe("95.5%");
      expect(formatPercent(100, "vi")).toBe("100%");
    });
  });

  describe("formatDate", () => {
    const fixedDate = new Date(2026, 7, 22, 14, 30); // 22 Aug 2026 14:30

    it("formats short date preset according to locale conventions", () => {
      const viShort = formatDate(fixedDate, "vi", { preset: "short" });
      const enShort = formatDate(fixedDate, "en", { preset: "short" });

      expect(viShort).toBe("22/08/2026");
      expect(enShort).toBe("08/22/2026");
    });

    it("formats timeOnly preset", () => {
      const timeStr = formatDate(fixedDate, "en", { preset: "timeOnly" });
      expect(timeStr).toMatch(/02:30\s*PM|14:30/i);
    });

    it("handles invalid dates safely by returning empty string", () => {
      expect(formatDate("invalid-date", "en")).toBe("");
    });
  });

  describe("formatRelativeTime", () => {
    const base = new Date(2026, 7, 22, 12, 0, 0);

    it("formats past hours in English and Vietnamese", () => {
      const twoHoursAgo = new Date(2026, 7, 22, 10, 0, 0);
      expect(formatRelativeTime(twoHoursAgo, "en", base)).toBe("2 hours ago");
      expect(formatRelativeTime(twoHoursAgo, "vi", base)).toBe("2 giờ trước");
    });

    it("formats yesterday / days ago", () => {
      const oneDayAgo = new Date(2026, 7, 21, 12, 0, 0);
      expect(formatRelativeTime(oneDayAgo, "en", base)).toBe("yesterday");
      expect(formatRelativeTime(oneDayAgo, "vi", base)).toBe("Hôm qua");

      const threeDaysAgo = new Date(2026, 7, 19, 12, 0, 0);
      expect(formatRelativeTime(threeDaysAgo, "en", base)).toBe("3 days ago");
      expect(formatRelativeTime(threeDaysAgo, "vi", base)).toBe("3 ngày trước");
    });

    it("formats minutes ago", () => {
      const fiveMinsAgo = new Date(2026, 7, 22, 11, 55, 0);
      expect(formatRelativeTime(fiveMinsAgo, "en", base)).toBe("5 minutes ago");
      expect(formatRelativeTime(fiveMinsAgo, "vi", base)).toBe("5 phút trước");
    });

    it("returns empty string for invalid dates", () => {
      expect(formatRelativeTime("invalid", "en", base)).toBe("");
    });
  });
});
