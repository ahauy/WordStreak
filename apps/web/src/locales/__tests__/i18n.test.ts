import { describe, it, expect, beforeEach } from "vitest";
import i18n from "../i18n";

describe("i18n Initialization & Language Switching", () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage("en");
  });

  it('initializes with default namespace "common" and fallback language "en"', () => {
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.options.fallbackLng).toContain("en");
    expect(i18n.options.defaultNS).toBe("common");
  });

  it("translates common brand and nav keys correctly in English", () => {
    expect(i18n.t("brand.name")).toBe("WordStreak");
    expect(i18n.t("nav.dashboard")).toBe("Overview");
    expect(i18n.t("nav.decks")).toBe("Decks");
  });

  it("translates across namespaces without full page reload", async () => {
    await i18n.changeLanguage("vi");
    expect(i18n.language).toBe("vi");
    expect(i18n.t("brand.tagline")).toBe("Ôn tập ngắt quãng 100% Miễn phí");
    expect(i18n.t("nav.dashboard")).toBe("Tổng quan");
    expect(i18n.t("auth:login.submitButton")).toBe("Đăng nhập");
    expect(i18n.t("dashboard:welcome.greeting")).toBe("Chào mừng trở lại");
  });

  it("switches back to English cleanly", async () => {
    await i18n.changeLanguage("vi");
    expect(i18n.language).toBe("vi");

    await i18n.changeLanguage("en");
    expect(i18n.language).toBe("en");
    expect(i18n.t("nav.dashboard")).toBe("Overview");
    expect(i18n.t("auth:login.submitButton")).toBe("Sign In");
  });
});
