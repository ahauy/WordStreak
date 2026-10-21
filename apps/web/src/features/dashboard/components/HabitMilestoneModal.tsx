import React, { useEffect } from "react";
import { Trophy, Sparkles, X, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { HabitMilestone } from "@wordstreak/shared-types";

export interface HabitMilestoneModalProps {
  isOpen: boolean;
  milestone: HabitMilestone | null;
  onClose: () => void;
}

export const HabitMilestoneModal: React.FC<HabitMilestoneModalProps> = ({
  isOpen,
  milestone,
  onClose,
}) => {
  const { t } = useTranslation(["dashboard", "common"]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !milestone) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="habit-milestone-title"
      data-testid="habit-milestone-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-6 sm:p-8 bg-[#ffffff] rounded-2xl border border-[#e5e5e5] shadow-xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common:actions.close", "Close")}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#737373] hover:text-[#000000] hover:bg-[#f5f5f5] transition-colors focus:outline-none focus:ring-2 focus:ring-black"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Milestone Icon & Pill Badge */}
        <div className="w-16 h-16 rounded-full bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center mx-auto mb-4 relative">
          <Trophy className="w-8 h-8 text-[#ffbd2e]" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7000ff] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#7000ff]"></span>
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full bg-[#fafafa] border border-[#e5e5e5] text-[11px] font-mono font-medium text-[#525252]">
          <Sparkles className="w-3 h-3 text-[#7000ff]" />
          <span>{t("dashboard:milestones.badge", "Cột mốc thói quen")}</span>
          <span className="font-bold text-[#000000]">· {milestone.targetWords} từ</span>
        </div>

        {/* Title & Description */}
        <h2
          id="habit-milestone-title"
          className="text-2xl sm:text-3xl font-semibold text-[#000000] font-display mb-3"
        >
          {t(`dashboard:milestones.${milestone.titleKey}`, `${milestone.targetWords} từ vựng đã ghi nhớ!`)}
        </h2>

        <p className="text-sm text-[#737373] leading-relaxed mb-6 font-sans">
          {t(`dashboard:milestones.${milestone.descKey}`, "Bạn đã đạt cột mốc từ vựng quan trọng trên con đường làm chủ tiếng Anh!")}
        </p>

        {/* Action Button - Obsidian pure black pill */}
        <div className="relative inline-block w-full">
          <button
            type="button"
            onClick={onClose}
            data-testid="habit-milestone-cta"
            className="group relative w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-[#000000] text-white hover:bg-[#171717] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            <span>{t("dashboard:milestones.cta", "Tiếp tục học")}</span>
            <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
