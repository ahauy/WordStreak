import { describe, it, expect, beforeEach } from "vitest";
import i18n from "../i18n";
import { resources } from "../index";

describe("i18n 9-Namespace Structure & Fallback Resiliency", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("vi");
  });

  it("contains all 9 domain namespaces in both en and vi", () => {
    const namespaces = [
      "common",
      "auth",
      "dashboard",
      "decks",
      "study",
      "practice",
      "community",
      "analytics",
      "settings",
    ] as const;

    namespaces.forEach((ns) => {
      expect(resources.en).toHaveProperty(ns);
      expect(resources.vi).toHaveProperty(ns);
    });
  });

  it("gracefully falls back to English when a translation key is missing in Vietnamese", async () => {
    // Add a temporary mock key in English namespace only
    i18n.addResource(
      "en",
      "common",
      "mockMissingKey",
      "English Fallback Value",
    );

    expect(i18n.t("mockMissingKey")).toBe("English Fallback Value");
  });

  it("handles pluralization and interpolation correctly", () => {
    expect(i18n.t("decks:cardCount_one", { count: 1 })).toBe("1 thẻ");
    expect(i18n.t("decks:cardCount_other", { count: 42 })).toBe("42 thẻ");
  });
});
