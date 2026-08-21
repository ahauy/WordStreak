import React, { useState } from "react";
import { Shield, Snowflake, Sparkles, Clock, Info } from "lucide-react";
import { StreakFlame } from "./StreakFlame";
import { getFlameTier } from "../config/flameTiers";
import { useStreak } from "../hooks/useStreak";

export interface StreakWidgetProps {
  currentStreak?: number;
  longestStreak?: number;
  streakFreezes?: number;
  maxStreakFreezes?: number;
  flameTier?: number;
  isActiveToday?: boolean;
  isPendingToday?: boolean;
  onOpenFlameNurture?: () => void;
  className?: string;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({
  currentStreak: propCurrentStreak,
  longestStreak: propLongestStreak,
  streakFreezes: propStreakFreezes,
  maxStreakFreezes: propMaxStreakFreezes,
  flameTier: propFlameTier,
  isActiveToday: propIsActiveToday,
  isPendingToday: propIsPendingToday,
  onOpenFlameNurture,
  className = "",
}) => {
  const hook = useStreak({
    enabled: propCurrentStreak === undefined && propStreakFreezes === undefined,
  });

  const currentStreak =
    propCurrentStreak !== undefined ? propCurrentStreak : hook.currentStreak;
  const longestStreak =
    propLongestStreak !== undefined ? propLongestStreak : hook.bestStreak;
  const streakFreezes =
    propStreakFreezes !== undefined ? propStreakFreezes : hook.streakFreezes;
  const maxStreakFreezes =
    propMaxStreakFreezes !== undefined
      ? propMaxStreakFreezes
      : hook.maxStreakFreezes;
  const flameTier =
    propFlameTier !== undefined ? propFlameTier : hook.flameTier;
  const isActiveToday =
    propIsActiveToday !== undefined ? propIsActiveToday : hook.isActiveToday;
  const isPendingToday =
    propIsPendingToday !== undefined ? propIsPendingToday : hook.isPendingToday;

  const tierInfo = getFlameTier(currentStreak);
  const [showTooltip, setShowTooltip] = useState(false);

  const tooltipText =
    "Streak Freeze: Automatically protects your streak if you miss a day. Holds up to 2 freezes.";

  return (
    <div
      data-testid="streak-widget"
      className={`relative overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-6 shadow-xs group ${className}`}
    >
      {/* Header: Title & Flame Icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
          <span>Streak Status</span>
          {isActiveToday ? (
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#15803d]"
              title="Active Today"
            />
          ) : isPendingToday ? (
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse"
              title="Pending Today"
            />
          ) : null}
        </span>

        <button
          type="button"
          onClick={onOpenFlameNurture}
          aria-label="Mở khu vườn nuôi lửa streak"
          title="Nhấn để mở Khu Vườn Nuôi Lửa"
          className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer hover:scale-105 active:scale-95 transition-transform ${tierInfo.pillBg} ${tierInfo.pillBorder}`}
        >
          <StreakFlame
            streakDays={currentStreak}
            tier={flameTier}
            size="xs"
            showEmbers={false}
            isActiveToday={isActiveToday}
          />
        </button>
      </div>

      {/* Main Metric & Tier */}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span
          data-testid="streak-days-count"
          className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight font-mono"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {currentStreak}
        </span>
        <span className="text-xs font-medium text-[#737373]">Days</span>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${tierInfo.pillBg} ${tierInfo.pillText} ${tierInfo.pillBorder}`}
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>{tierInfo.titleVi}</span>
        </span>
      </div>

      {/* Bottom Row: Best Streak & Frost Freeze Badge */}
      <div className="mt-4 pt-3 border-t border-[#f0f0f0] flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1 text-[#737373] font-medium">
          <Clock className="w-3.5 h-3.5 text-[#9333ea]" />
          <span>Best: {longestStreak}d</span>
        </span>

        {/* Frost Ice Shield Badge with Hover Tooltip */}
        <div
          className="relative inline-flex items-center"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div
            data-testid="streak-freeze-badge"
            aria-describedby="streak-freeze-tooltip"
            tabIndex={0}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200 cursor-help transition-colors hover:bg-cyan-100/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <Shield className="w-3 h-3 text-cyan-600" />
            <Snowflake className="w-2.5 h-2.5 text-cyan-500" />
            <span className="font-mono">
              {streakFreezes}/{maxStreakFreezes} 🧊
            </span>
          </div>

          {/* Accessible Hover / Focus Tooltip (Fixed stable wrapper to prevent jitter) */}
          <div
            id="streak-freeze-tooltip"
            role="tooltip"
            data-testid="streak-freeze-tooltip"
            className={`absolute bottom-full right-0 mb-2 w-56 p-2.5 bg-black text-white text-[11px] leading-relaxed rounded-xl shadow-lg border border-[#333333] transition-all duration-200 z-40 pointer-events-none ${
              showTooltip
                ? "opacity-100 visible translate-y-0"
                : "opacity-0 invisible translate-y-1"
            }`}
          >
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>{tooltipText}</span>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-black" />
          </div>
        </div>
      </div>
    </div>
  );
};
