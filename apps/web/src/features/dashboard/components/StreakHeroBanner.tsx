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
import { StreakFlame } from "./StreakFlame";
import { getFlameTier } from "../config/flameTiers";

interface StreakHeroBannerProps {
  username?: string;
  currentStreak?: number;
  onStartReview?: () => void;
  onCreateDeck?: () => void;
  onOpenFlameNurture?: () => void;
}

export const StreakHeroBanner: React.FC<StreakHeroBannerProps> = ({
  username = "Learner",
  currentStreak = 0,
  onStartReview,
  onCreateDeck,
  onOpenFlameNurture,
}) => {
  const tierInfo = getFlameTier(currentStreak);

  // Days of current week representation (Mon -> Sun)
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 for Monday, 6 for Sunday
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer hover:scale-105 active:scale-95 transition-all ${tierInfo.pillBg} ${tierInfo.pillText} ${tierInfo.pillBorder}`}
              title="Mở Khu Vườn Nuôi Lửa & Tiến Hóa"
            >
              <StreakFlame
                streakDays={currentStreak}
                size="xs"
                showEmbers={false}
                showGlow={false}
              />
              <span>{tierInfo.titleVi}</span>
              <Sparkles className="w-3 h-3 ml-0.5 opacity-75" />
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#f3e8ff] text-[#7e22ce] border border-[#e9d5ff]">
              <Brain className="w-3.5 h-3.5 text-[#9333ea]" />
              <span>SM-2 Spaced Repetition</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Multi-Session Active</span>
            </span>
          </div>

          {/* Heading */}
          <h1
            className="text-3xl sm:text-4xl lg:text-[38px] font-bold text-black tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready for today's streak,{" "}
            <span className="text-[#9333ea]">{username}</span>?
          </h1>

          {/* Subtext */}
          <p className="text-[#737373] text-sm sm:text-[15px] leading-relaxed">
            Your spaced repetition review session is ready. Practice now to
            reinforce short-term memory into permanent recall and keep your{" "}
            <strong className="text-black font-semibold">
              {currentStreak}-day streak ({tierInfo.titleVi})
            </strong>{" "}
            burning!
          </p>

          {/* 7-Day Weekly Streak Tracker */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#525252] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#9333ea]" />
              <span>This Week:</span>
            </span>
            <div className="flex items-center gap-2">
              {daysOfWeek.map((day, idx) => {
                const isToday = idx === todayIndex;
                const isCompleted = idx < todayIndex && currentStreak > 0;

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1"
                    title={`${dayNames[idx]}${isToday ? " (Today)" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                        isCompleted
                          ? "bg-[#9333ea] text-white shadow-xs"
                          : isToday
                            ? "bg-[#f3e8ff] border-2 border-[#9333ea] text-[#7e22ce] shadow-xs scale-105 animate-pulse"
                            : "bg-[#fafafa] border border-[#e5e5e5] text-[#a3a3a3]"
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
            className="btn-primary h-12 px-7 text-sm font-medium gap-2 shadow-xs cursor-pointer"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Start Daily Review</span>
          </button>

          <button
            type="button"
            onClick={onCreateDeck}
            className="btn-secondary h-12 px-7 text-sm font-medium gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#525252]" />
            <span>Create Deck</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
