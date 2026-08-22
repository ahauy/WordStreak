import React from "react";
import { useTranslation } from "react-i18next";
import type { LanguageSwitcherProps } from "./LanguageSwitcher.types";
import type { SupportedLocale } from "../../locales/types";
import { SUPPORTED_LOCALES } from "../../locales/constants";
import { safeSetLocale } from "../../locales/utils/storage";
import { syncLanguagePreference } from "../../lib/languageSync";

const VARIANT_STYLES: Record<
  NonNullable<LanguageSwitcherProps["variant"]>,
  string
> = {
  subtle:
    "h-8 min-w-[70px] px-2.5 py-1 border border-black bg-white hover:bg-[#fafafa] text-black shadow-xs",
  obsidian:
    "h-8 min-w-[70px] px-2.5 py-1 border border-[#333333] hover:border-[#555555] bg-black hover:bg-[#171717] text-white shadow-xs",
  compact:
    "h-7 min-w-[62px] px-2 py-0.5 border border-black bg-white hover:bg-[#fafafa] text-black",
};

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  variant = "subtle",
  onLocaleChange,
  ariaLabel,
}) => {
  const { i18n, t } = useTranslation("common");

  const currentLocale: SupportedLocale = i18n.language?.startsWith("vi")
    ? "vi"
    : "en";
  const targetLocale: SupportedLocale = currentLocale === "vi" ? "en" : "vi";
  const currentMetadata =
    SUPPORTED_LOCALES[currentLocale] || SUPPORTED_LOCALES.en;

  const handleToggle = () => {
    i18n.changeLanguage(targetLocale);
    safeSetLocale(targetLocale);
    syncLanguagePreference(targetLocale);
    if (onLocaleChange) {
      onLocaleChange(targetLocale);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    }
  };

  const defaultAria =
    currentLocale === "en"
      ? t("switcher.toggleAriaVi", "Chuyển sang Tiếng Việt")
      : t("switcher.toggleAriaEn", "Switch to English");

  const resolvedAriaLabel = ariaLabel || defaultAria;
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.subtle;

  return (
    <div
      className={`language-switcher-anchor inline-flex items-center shrink-0 select-none ${className}`}
    >
      <button
        type="button"
        role="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-label={resolvedAriaLabel}
        title={resolvedAriaLabel}
        className={`group relative inline-flex items-center justify-center gap-1.5 rounded-full font-mono text-xs font-bold tracking-wider transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 hover:scale-[1.02] active:scale-[0.98] ${variantClass}`}
      >
        <span className="text-sm leading-none shrink-0" aria-hidden="true">
          {currentMetadata.flag}
        </span>
        <span className="tabular-nums tracking-widest leading-none font-bold">
          {currentMetadata.label}
        </span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
