import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../locales/i18n";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { STORAGE_KEY } from "../../../locales/constants";

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

describe("LanguageSwitcher Component (TC-I18N-002 & TC-I18N-003)", () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage("en");
  });

  describe("Visual Presentation & Design Token Compliance", () => {
    it("renders the English indicator (🇬🇧 EN) when active language is English", () => {
      renderWithI18n(<LanguageSwitcher />);
      const button = screen.getByRole("button");

      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("🇬🇧");
      expect(button).toHaveTextContent("EN");
    });

    it("renders the Vietnamese indicator (🇻🇳 VI) when active language is Vietnamese", async () => {
      await i18n.changeLanguage("vi");
      renderWithI18n(<LanguageSwitcher />);
      const button = screen.getByRole("button");

      expect(button).toHaveTextContent("🇻🇳");
      expect(button).toHaveTextContent("VI");
    });

    it("complies with White background & Black border design tokens by default (min-w-[70px], h-8, rounded-full, font-mono, white bg, black border)", () => {
      renderWithI18n(<LanguageSwitcher />);
      const button = screen.getByRole("button");

      expect(button.className).toContain("rounded-full");
      expect(button.className).toContain("font-mono");
      expect(button.className).toContain("bg-white");
      expect(button.className).toContain("border-black");
      expect(button.className).toContain("text-black");
      expect(button.className).toContain("min-w-[70px]");
      expect(button.className).toContain("h-8");
      expect(button.className).not.toContain("dark:bg-black");
      expect(button.className).not.toContain("dark:text-white");
      expect(button.className).not.toContain("dark:border-white");
    });

    it("maintains white background and black border even when dark mode class is active on documentElement", () => {
      document.documentElement.classList.add("dark");
      renderWithI18n(<LanguageSwitcher />);
      const button = screen.getByRole("button");

      expect(button.className).toContain("bg-white");
      expect(button.className).toContain("border-black");
      expect(button.className).toContain("text-black");
      expect(button.className).not.toContain("dark:bg-black");
      document.documentElement.classList.remove("dark");
    });

    it("supports obsidian variant for dark inverted surfaces", () => {
      renderWithI18n(<LanguageSwitcher variant="obsidian" />);
      const button = screen.getByRole("button");

      expect(button.className).toContain("bg-black");
      expect(button.className).toContain("text-white");
      expect(button.className).toContain("border-[#333333]");
      expect(button.className).toContain("min-w-[70px]");
      expect(button.className).toContain("h-8");
    });

    it("supports compact variant with reduced height, width, white bg, and black border", () => {
      renderWithI18n(<LanguageSwitcher variant="compact" />);
      const button = screen.getByRole("button");

      expect(button.className).toContain("h-7");
      expect(button.className).toContain("min-w-[62px]");
      expect(button.className).toContain("bg-white");
      expect(button.className).toContain("border-black");
      expect(button.className).toContain("text-black");
      expect(button.className).not.toContain("dark:bg-black");
    });

    it("applies custom className if provided", () => {
      renderWithI18n(<LanguageSwitcher className="custom-test-class" />);
      const anchor =
        screen.getByRole("button").closest(".language-switcher-anchor") ||
        screen.getByRole("button");
      expect(anchor.className).toContain("custom-test-class");
    });
  });

  describe("Interaction & Language Toggling", () => {
    it("toggles from EN to VI on click and updates localStorage and aria-label", async () => {
      const onLocaleChange = vi.fn();
      renderWithI18n(<LanguageSwitcher onLocaleChange={onLocaleChange} />);
      const button = screen.getByRole("button");

      expect(button).toHaveAttribute("aria-label", "Chuyển sang Tiếng Việt");

      fireEvent.click(button);

      expect(i18n.language).toBe("vi");
      expect(button).toHaveTextContent("🇻🇳");
      expect(button).toHaveTextContent("VI");
      expect(button).toHaveAttribute("aria-label", "Switch to English");
      expect(localStorage.getItem(STORAGE_KEY)).toBe("vi");
      expect(onLocaleChange).toHaveBeenCalledWith("vi");
    });

    it("toggles from VI to EN on subsequent click", async () => {
      await i18n.changeLanguage("vi");
      const onLocaleChange = vi.fn();
      renderWithI18n(<LanguageSwitcher onLocaleChange={onLocaleChange} />);
      const button = screen.getByRole("button");

      fireEvent.click(button);

      expect(i18n.language).toBe("en");
      expect(button).toHaveTextContent("🇬🇧");
      expect(button).toHaveTextContent("EN");
      expect(button).toHaveAttribute("aria-label", "Chuyển sang Tiếng Việt");
      expect(localStorage.getItem(STORAGE_KEY)).toBe("en");
      expect(onLocaleChange).toHaveBeenCalledWith("en");
    });

    it("toggles on Enter and Space keypresses for accessibility", async () => {
      renderWithI18n(<LanguageSwitcher />);
      const button = screen.getByRole("button");

      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
      expect(i18n.language).toBe("vi");

      fireEvent.keyDown(button, { key: " ", code: "Space" });
      expect(i18n.language).toBe("en");
    });
  });
});
