import React from "react";
import { useTranslation } from "react-i18next";
import { Globe, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { SupportedLocale } from "../../../locales/types";
import { safeSetLocale } from "../../../locales/utils/storage";
import { syncLanguagePreference } from "../../../lib/languageSync";

interface LanguageOption {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    flag: "🇻🇳",
    region: "Vietnam",
  },
  {
    code: "en",
    name: "English (US)",
    nativeName: "English",
    flag: "🇬🇧",
    region: "International",
  },
];

export const LanguageSettingsTab: React.FC = () => {
  const { t, i18n } = useTranslation(["settings", "common"]);

  const currentLocale: SupportedLocale = i18n.language?.startsWith("vi")
    ? "vi"
    : "en";

  const handleSelectLanguage = (targetLocale: SupportedLocale) => {
    if (targetLocale === currentLocale) return;

    // Optimistic instantaneous switch (<16ms)
    i18n.changeLanguage(targetLocale);
    safeSetLocale(targetLocale);

    // Debounced background persistence
    syncLanguagePreference(targetLocale);
  };

  return (
    <div className="space-y-5" data-testid="language-settings-tab">
      {/* Section Header */}
      <div>
        <h3 className="font-bold text-black flex items-center gap-2 text-sm sm:text-base">
          <Globe className="w-4 h-4 text-[#9333ea]" />
          {t("settings:language.title", "Language & Region")}
        </h3>
        <p className="text-xs text-[#737373] mt-0.5">
          {t(
            "settings:language.description",
            "Choose your preferred interface language for WordStreak.",
          )}
        </p>
      </div>

      {/* Language Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {LANGUAGE_OPTIONS.map((option) => {
          const isSelected = currentLocale === option.code;

          return (
            <motion.button
              key={option.code}
              type="button"
              onClick={() => handleSelectLanguage(option.code)}
              whileTap={{ scale: 0.98 }}
              data-testid={`language-card-${option.code}`}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? "bg-[#f3e8ff]/60 border-2 border-[#9333ea] shadow-xs"
                  : "bg-[#fafafa] border-[#e5e5e5] hover:border-[#d4d4d4] hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className="text-2xl leading-none shrink-0"
                  aria-hidden="true"
                >
                  {option.flag}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-black">
                      {option.nativeName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-black/5 text-[#525252]">
                      {option.code.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#737373] truncate">
                    {option.name} • {option.region}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-[#9333ea] text-white flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-[#d4d4d4] bg-white" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Real-time Notice Callout */}
      <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] text-xs text-[#737373] flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 flex-shrink-0 text-[#9333ea] mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-medium text-black">
            {t(
              "settings:language.appliedImmediately",
              "Language changes are applied immediately across the entire application.",
            )}
          </p>
          <p className="text-[11px] text-[#737373]">
            {t(
              "settings:language.autoSync",
              "Your preferences are saved and automatically synchronized across all your devices.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
