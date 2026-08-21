import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Target, Zap, Trophy } from "lucide-react";
import type { XpBreakdownItem } from "@wordstreak/shared-types";

export interface FloatingXpToastProps {
  xpEarned: number;
  breakdown?: XpBreakdownItem[];
  onComplete?: () => void;
  durationMs?: number;
  className?: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CARD_REVIEW: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
  DAILY_GOAL_COMPLETED: <Target className="w-3.5 h-3.5 text-purple-600" />,
  STREAK_7_DAYS: <Zap className="w-3.5 h-3.5 text-amber-500" />,
  STREAK_30_DAYS: <Trophy className="w-3.5 h-3.5 text-purple-600" />,
  PRACTICE_QUIZ: <Sparkles className="w-3.5 h-3.5 text-cyan-500" />,
};

export const FloatingXpToast: React.FC<FloatingXpToastProps> = ({
  xpEarned,
  breakdown = [],
  onComplete,
  durationMs = 1200,
  className = "",
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onComplete]);

  if (xpEarned <= 0 && breakdown.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.85 }}
        animate={{ opacity: 1, y: -24, scale: 1 }}
        exit={{ opacity: 0, y: -36, scale: 0.9 }}
        transition={{
          duration: durationMs / 1000,
          ease: [0.16, 1, 0.3, 1],
        }}
        data-testid="floating-xp-toast"
        role="status"
        aria-live="polite"
        className={`pointer-events-none z-50 flex flex-col items-center gap-1 select-none ${className}`}
      >
        {/* Main XP Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/90 text-white border border-purple-500/40 shadow-lg backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span
            className="text-sm font-extrabold text-white font-mono tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            +{xpEarned} XP
          </span>
        </div>

        {/* Bonus breakdowns if any */}
        {breakdown
          .filter((item) => item.type !== "CARD_REVIEW" && item.xp > 0)
          .map((bonus, idx) => (
            <motion.div
              key={`${bonus.type}-${idx}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + idx * 0.1, duration: 0.3 }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-200 border border-purple-400/30 text-[11px] font-semibold backdrop-blur-sm"
              data-testid="floating-xp-bonus-item"
            >
              {ACTION_ICONS[bonus.type] || (
                <Sparkles className="w-3 h-3 text-purple-300" />
              )}
              <span>
                {bonus.description ||
                  (bonus.type === "DAILY_GOAL_COMPLETED"
                    ? "Mục tiêu ngày!"
                    : bonus.type === "STREAK_7_DAYS"
                      ? "Mốc 7 ngày!"
                      : bonus.type === "STREAK_30_DAYS"
                        ? "Mốc 30 ngày!"
                        : bonus.type)}{" "}
                (+{bonus.xp} XP)
              </span>
            </motion.div>
          ))}
      </motion.div>
    </AnimatePresence>
  );
};
