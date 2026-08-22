import React from "react";
import {
  ShieldCheck,
  Zap,
  PlusCircle,
  CheckCircle2,
  Calendar,
  Brain,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation, Trans } from "react-i18next";
import { StreakFlame } from "./StreakFlame";
import { getFlameTier } from "../config/flameTiers";

interface StreakHeroBannerProps {
  username?: string;
  currentStreak?: number;
  isActiveToday?: boolean;
  isPendingToday?: boolean;
  flameTier?: number;
  onStartReview?: () => void;
  onCreateDeck?: () => void;
  onOpenFlameNurture?: () => void;
}

export const StreakHeroBanner: React.FC<StreakHeroBannerProps> = ({
  username = "Learner",
  currentStreak = 0,
  isActiveToday = false,
  isPendingToday = false,
  flameTier,
  onStartReview,
  onCreateDeck,
  onOpenFlameNurture,
}) => {
  const { t, i18n } = useTranslation(["dashboard", "common"]);
  const tierInfo = getFlameTier(currentStreak);

  // Days of current week representation (Mon -> Sun)
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 for Monday, 6 for Sunday
  const daysOfWeek =
    i18n.language === "vi"
      ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
      : ["M", "T", "W", "T", "F", "S", "S"];
  const dayNames =
    i18n.language === "vi"
      ? ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const tierTitle = i18n.language === "vi" ? tierInfo.titleVi : tierInfo.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-9 shadow-xs"
    >
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Column: Greeting & Mission */}
        <div className="space-y-4 max-w-2xl">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenFlameNurture}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus:outline-none ${tierInfo.pillBg} ${tierInfo.pillText} ${tierInfo.pillBorder}`}
              title={t(
                "hero.openGardenTitle",
                "Mở Khu Vườn Nuôi Lửa & Tiến Hóa",
              )}
              aria-label={t(
                "hero.openGardenAria",
                "Mở khu vườn nuôi lửa và tiến hóa",
              )}
            >
              <StreakFlame
                streakDays={currentStreak}
                tier={flameTier}
                size="xs"
                showEmbers={false}
                showGlow={false}
                isActiveToday={isActiveToday}
              />
              <span>{tierTitle}</span>
              <Sparkles className="w-3 h-3 ml-0.5 opacity-75" />
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#f3e8ff] text-[#7e22ce] border border-[#e9d5ff]">
              <Brain className="w-3.5 h-3.5 text-[#9333ea]" />
              <span>{t("hero.sm2Badge", "SM-2 Spaced Repetition")}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {isActiveToday
                  ? t("hero.completedToday", "Completed Today")
                  : currentStreak > 0
                    ? isPendingToday
                      ? t("hero.pendingReview", "Streak Pending Review")
                      : t("hero.reviewReady", "Review Ready")
                    : t("hero.readyToLearn", "Ready to Learn")}
              </span>
            </span>
          </div>

          {/* Heading */}
          <h1
            className="text-3xl sm:text-4xl lg:text-[38px] font-bold text-black tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {currentStreak > 0 ? (
              <Trans
                i18nKey="hero.readyGreeting"
                ns="dashboard"
                values={{ username }}
                defaults="Ready for today's streak, <1>{{username}}</1>?"
                components={{
                  1: <span className="text-[#9333ea]" />,
                }}
              />
            ) : (
              <Trans
                i18nKey="hero.welcomeGreeting"
                ns="dashboard"
                values={{ username }}
                defaults="Welcome to WordStreak, <1>{{username}}</1>!"
                components={{
                  1: <span className="text-[#9333ea]" />,
                }}
              />
            )}
          </h1>

          {/* Subtext */}
          <p className="text-[#737373] text-sm sm:text-[15px] leading-relaxed">
            {currentStreak > 0 ? (
              <Trans
                i18nKey="hero.subtextStreak"
                ns="dashboard"
                values={{ count: currentStreak, tierTitle }}
                defaults="Your Spaced Repetition review session is ready. Study now to reinforce permanent memory and keep your <1>{{count}}-day streak ({{tierTitle}})</1> burning brightly!"
                components={{
                  1: <span className="font-semibold text-black" />,
                }}
              />
            ) : (
              t(
                "hero.subtextNoStreak",
                "Start your scientific vocabulary journey. Create your first deck or begin a review session to activate your streak and nurture your companion purple flame!",
              )
            )}
          </p>

          {/* 7-Day Weekly Streak Tracker */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#525252] flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#9333ea]" />
              <span>{t("hero.thisWeek", "This week:")}</span>
            </span>
            <div className="flex items-center gap-2">
              {daysOfWeek.map((day, idx) => {
                const isToday = idx === todayIndex;
                const isPastDay = idx < todayIndex;
                const daysAgo = todayIndex - idx;
                const isCompleted = isToday
                  ? isActiveToday
                  : isPastDay &&
                    currentStreak > 0 &&
                    currentStreak > (isActiveToday ? daysAgo : daysAgo - 1);

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1"
                    title={`${dayNames[idx]}${isToday ? ` (${t("hero.today", "Today")})` : ""}`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                        isCompleted
                          ? "bg-[#9333ea] text-white shadow-xs"
                          : isToday
                            ? "bg-[#f3e8ff] border-2 border-[#9333ea] text-[#7e22ce] shadow-xs scale-105 animate-pulse"
                            : "bg-[#fafafa] border border-[#e5e5e5] text-[#737373]"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        day
                      )}
                    </div>
                    <span className="text-[10px] text-[#737373] font-medium">
                      {dayNames[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: High-Impact CTAs */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 sm:w-auto w-full">
          <button
            type="button"
            onClick={onStartReview}
            className="btn-primary h-12 px-7 text-sm font-medium gap-2 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus:outline-none"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{t("hero.startDailyReview", "Start Daily Review")}</span>
          </button>

          <button
            type="button"
            onClick={onCreateDeck}
            className="btn-secondary h-12 px-7 text-sm font-medium gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus:outline-none"
          >
            <PlusCircle className="w-4 h-4 text-[#525252]" />
            <span>{t("hero.createDeck", "Create Deck")}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
