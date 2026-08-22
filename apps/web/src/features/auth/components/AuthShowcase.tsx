import React, { useState } from "react";
import {
  Brain,
  Volume2,
  CheckCircle2,
  TrendingUp,
  Award,
  Download,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { PurpleStreakFlame } from "../../landing/components/PurpleStreakFlame";

export const AuthShowcase: React.FC = () => {
  const { t } = useTranslation(["auth", "common"]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [cardMastered, setCardMastered] = useState(false);

  const handlePronounce = () => {
    setIsPlayingAudio(true);
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance("ephemeral");
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 800);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="hidden lg:flex flex-col justify-center p-2 xl:p-4 max-w-lg w-full"
    >
      {/* Top Editorial Brand Introduction */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3 py-1 text-xs font-mono text-[#525252]">
          <span className="flex h-2 w-2 rounded-full bg-[#27c93f] animate-pulse" />
          <span>
            {t("auth:showcase.freeForever", "100% Free Forever · No Paywalls")}
          </span>
        </div>

        <h1
          className="text-4xl xl:text-[42px] font-bold text-black leading-[1.12] tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("auth:showcase.headlineStick", "Master words that")}{" "}
          <span className="text-[#9333ea]">
            {t("auth:showcase.headlineStickHighlight", "stick.")}
          </span>
        </h1>
        <p className="text-[15px] text-[#737373] leading-relaxed">
          {t(
            "auth:showcase.subheadline",
            "Algorithmic spaced repetition and active recall engineered into a calm, habit-forming daily loop.",
          )}
        </p>
      </div>

      {/* Interactive Physical Vocabulary Card (Clean Hairline Surface) */}
      <div className="my-6 relative">
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="clean-card rounded-2xl p-6 space-y-4 bg-white border border-[#e5e5e5] shadow-xs relative"
        >
          {/* Card Header Pill */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#f3e8ff] text-[#7e22ce] border border-[#e9d5ff]">
              <Brain className="w-3.5 h-3.5 text-[#9333ea]" />
              {t("auth:showcase.sm2Pill", "Spaced Repetition · SM-2")}
            </span>
            <span className="text-xs font-medium text-[#525252] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#27c93f]" />
              {t("auth:showcase.reviewDays", {
                count: 4,
                defaultValue: "Review in 4 days",
              })}
            </span>
          </div>

          {/* Word & Pronunciation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2
                className="text-3xl font-extrabold text-black tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ephemeral
              </h2>
              <button
                type="button"
                onClick={handlePronounce}
                className={`p-2.5 rounded-full transition-all duration-150 border cursor-pointer apple-tap-active focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9333ea] ${
                  isPlayingAudio
                    ? "bg-[#9333ea] text-white border-[#9333ea] shadow-md shadow-[#9333ea]/25"
                    : "bg-[#fafafa] text-black hover:text-[#9333ea] hover:border-[#d8b4fe] border-[#e5e5e5]"
                }`}
                title="Listen to pronunciation"
                aria-label="Listen to pronunciation of ephemeral"
              >
                <Volume2
                  className={`w-4 h-4 ${isPlayingAudio ? "animate-pulse" : ""}`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#737373]">
              <span className="font-mono text-[#525252]">/ɪˈfem.ər.əl/</span>
              <span className="w-1 h-1 rounded-full bg-[#d4d4d4]" />
              <span className="italic text-[#737373]">adjective</span>
            </div>
          </div>

          {/* Definition & Example */}
          <div className="space-y-2 pt-2 border-t border-[#f0f0f0]">
            <p className="text-[14px] font-normal text-[#171717] leading-snug">
              Lasting for a very short time; transitory; fleeting.
            </p>
            <p className="text-xs italic text-[#525252] leading-relaxed bg-[#fafafa] p-3 rounded-xl border border-[#e5e5e5]">
              &ldquo;Like morning mist over the valley, moments of clarity feel
              ephemeral yet profound.&rdquo;
            </p>
          </div>

          {/* Micro-learning Status & Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7e22ce] bg-[#f3e8ff] px-3 py-1 rounded-full border border-[#e9d5ff]">
                <PurpleStreakFlame
                  size="sm"
                  showEmbers={false}
                  className="w-4 h-4"
                />
                <span>
                  {t("auth:showcase.streakDays", {
                    count: 14,
                    defaultValue: "14-Day Streak",
                  })}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#525252] bg-[#fafafa] px-2.5 py-1 rounded-full border border-[#e5e5e5]">
                <Award className="w-3.5 h-3.5 text-[#9333ea]" />
                +25 XP
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCardMastered((prev) => !prev)}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 cursor-pointer apple-tap-active ${
                cardMastered
                  ? "bg-[#27c93f] text-white shadow-xs"
                  : "bg-white text-black hover:bg-[#fafafa] border border-[#d4d4d4] hover:border-black"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {cardMastered
                ? t("auth:showcase.remembered", "Remembered")
                : t("auth:showcase.markRemembered", "Mark Remembered")}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Credibility & Pedagogical Foundation */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#e5e5e5] text-xs">
        <div className="space-y-1">
          <p className="font-semibold text-xs text-black flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9333ea]" />
            {t("auth:showcase.sm2Title", "SM-2 Spaced Algorithm")}
          </p>
          <p className="text-[#737373] leading-normal text-[11px]">
            {t(
              "auth:showcase.sm2Desc",
              "Review intervals precisely tuned to defeat your forgetting curve.",
            )}
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-xs text-black flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-[#9333ea]" />
            {t("auth:showcase.ankiExportTitle", "Exportable to Anki")}
          </p>
          <p className="text-[#737373] leading-normal text-[11px]">
            {t(
              "auth:showcase.ankiExportDesc",
              "Your data stays yours. One-click export to Anki (.apkg) and CSV anytime.",
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
