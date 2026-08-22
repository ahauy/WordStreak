import React from "react";
import {
  Target,
  BookOpen,
  Layers,
  Clock,
  TrendingUp,
  Sliders,
  Shield,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { StreakFlame } from "./StreakFlame";
import { getFlameTier } from "../config/flameTiers";

interface DashboardStatsGridProps {
  currentStreak?: number;
  longestStreak?: number;
  dailyGoal?: number;
  cardsDueToday?: number;
  totalDecks?: number;
  streakFreezes?: number;
  maxStreakFreezes?: number;
  onOpenGoalSettings?: () => void;
  onOpenFlameNurture?: () => void;
  onCreateDeck?: () => void;
}

export const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({
  currentStreak = 0,
  longestStreak = 0,
  dailyGoal = 10,
  cardsDueToday = 0,
  totalDecks = 0,
  streakFreezes = 1,
  maxStreakFreezes = 2,
  onOpenGoalSettings,
  onOpenFlameNurture,
  onCreateDeck,
}) => {
  const { t, i18n } = useTranslation(["dashboard", "common"]);
  const tierInfo = getFlameTier(currentStreak);
  const tierTitle = i18n.language === "vi" ? tierInfo.titleVi : tierInfo.name;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* ─── Card 1: Current Streak (Interactive Nuôi Lửa) ─── */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={onOpenFlameNurture}
        className="relative overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-6 shadow-xs group cursor-pointer hover:border-black transition-colors"
        title={t(
          "grid.openGardenTooltip",
          "Nhấn để mở Khu Vườn Nuôi Lửa & Tiến Hóa",
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#737373] group-hover:text-black transition-colors">
            {t("grid.currentStreak", "Current Streak")}
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${tierInfo.pillBg} ${tierInfo.pillBorder}`}
          >
            <StreakFlame
              streakDays={currentStreak}
              size="xs"
              showEmbers={false}
            />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {currentStreak}
          </span>
          <span className="text-xs font-medium text-[#737373]">
            {t("grid.days", "Days")}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierInfo.pillBg} ${tierInfo.pillText} ${tierInfo.pillBorder}`}
          >
            {tierTitle}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-[#f0f0f0] flex items-center justify-between text-xs text-[#737373]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#9333ea]" />{" "}
            {t("grid.bestDays", {
              count: longestStreak,
              defaultValue: `Best: ${longestStreak}d`,
            })}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
            <Shield className="w-2.5 h-2.5 text-cyan-600" />{" "}
            {t("grid.freezeCount", {
              current: streakFreezes,
              max: maxStreakFreezes,
              defaultValue: `Freeze: ${streakFreezes}/${maxStreakFreezes}`,
            })}
          </span>
        </div>
      </motion.div>

      {/* ─── Card 2: Daily Goal (Interactive) ─── */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={onOpenGoalSettings}
        className="relative overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-6 shadow-xs group cursor-pointer hover:border-black transition-colors"
        title={t(
          "grid.openGoalTooltip",
          "Nhấn để tùy chỉnh mục tiêu hàng ngày",
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#737373] group-hover:text-black transition-colors flex items-center gap-1.5">
            {t("grid.dailyGoal", "Daily Goal")}
            <Sliders className="w-3.5 h-3.5 text-[#a3a3a3] group-hover:text-black transition-colors" />
          </span>
          <div className="w-9 h-9 rounded-xl bg-[#fafafa] border border-[#e5e5e5] text-black flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {dailyGoal}
          </span>
          <span className="text-xs font-medium text-[#737373]">
            {t("grid.cardsPerDay", "Cards/day")}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-[#f0f0f0] flex items-center justify-between text-xs">
          <span className="text-[#737373] group-hover:text-black transition-colors flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#9333ea]" />
            <span className="group-hover:underline font-medium">
              {t("grid.changeGoal", "Change goal")}
            </span>
          </span>
          <span className="text-[11px] font-mono text-[#737373]">
            0 / {dailyGoal}
          </span>
        </div>
      </motion.div>

      {/* ─── Card 3: Due Today (SM-2 Spaced Repetition) ─── */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-6 shadow-xs group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
            {t("grid.dueToday", "Due Today")}
          </span>
          <div className="w-9 h-9 rounded-xl bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {cardsDueToday}
          </span>
          <span className="text-xs font-medium text-[#737373]">
            {t("grid.cards", "Cards")}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-[#f0f0f0] flex items-center justify-between text-xs text-[#15803d]">
          <span className="flex items-center gap-1 font-medium">
            ✓{" "}
            {cardsDueToday === 0
              ? t("grid.allComplete", "All reviews complete!")
              : t("grid.readyToReview", "Ready to review")}
          </span>
          <span className="text-[10px] font-mono text-[#737373]">
            {t("grid.sm2Active", "SM-2 Active")}
          </span>
        </div>
      </motion.div>

      {/* ─── Card 4: Vocabulary Decks ─── */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={onCreateDeck}
        className="relative overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-6 shadow-xs group cursor-pointer hover:border-black transition-colors"
        title={t("grid.addNewDeck", "Thêm bộ từ mới")}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#737373] group-hover:text-black transition-colors">
            {t("grid.vocabDecks", "Vocabulary Decks")}
          </span>
          <div className="w-9 h-9 rounded-xl bg-[#f3e8ff] text-[#7e22ce] border border-[#e9d5ff] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {totalDecks}
          </span>
          <span className="text-xs font-medium text-[#737373]">
            {t("grid.decks", "Decks")}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-[#f0f0f0] flex items-center justify-between text-xs text-[#737373]">
          <span className="group-hover:text-black transition-colors flex items-center gap-1 font-medium">
            <Plus className="w-3.5 h-3.5 text-[#9333ea]" />
            <span>{t("grid.addNewDeck", "Add new deck")}</span>
          </span>
          <span className="text-[10px] font-mono text-[#7e22ce] font-bold bg-[#f3e8ff] px-2 py-0.5 rounded-full border border-[#e9d5ff]">
            {t("grid.newBadge", "+ New")}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
