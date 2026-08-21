import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Trophy, ArrowRight, Zap, Snowflake } from "lucide-react";
import { StreakFlame } from "./StreakFlame";
import { getFlameTier } from "../config/flameTiers";

export interface StreakCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  bestStreak?: number;
  flameTier?: number;
  message?: string;
  isNewBest?: boolean;
  earnedMilestoneFreeze?: boolean;
  streakFreezes?: number;
}

// Deterministic confetti particle data for celebration explosion
const CONFETTI_PARTICLES = Array.from({ length: 24 }).map((_, i) => {
  const angle = (i / 24) * 360;
  const rad = (angle * Math.PI) / 180;
  const distance = 80 + (i % 5) * 22;
  const x = Math.cos(rad) * distance;
  const y = Math.sin(rad) * distance;
  const colors = [
    "#9333ea", // Electric Violet
    "#c084fc", // Lavender
    "#7e22ce", // Deep Violet
    "#f59e0b", // Gold
    "#10b981", // Emerald
    "#000000", // Obsidian
  ];
  return {
    id: i,
    x,
    y,
    rotate: (i * 45) % 360,
    color: colors[i % colors.length],
    size: (i % 3) * 3 + 6,
    isCircle: i % 2 === 0,
    delay: (i % 4) * 0.05,
  };
});

export const StreakCelebrationModal: React.FC<StreakCelebrationModalProps> = ({
  isOpen,
  onClose,
  streakDays,
  bestStreak,
  flameTier,
  message,
  isNewBest,
  earnedMilestoneFreeze,
  streakFreezes,
}) => {
  const tierInfo = getFlameTier(streakDays);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const isFreezeMilestone =
    earnedMilestoneFreeze || streakDays === 7 || streakDays === 30;

  // Close on Escape key and autofocus primary action
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const timer = setTimeout(() => {
      primaryButtonRef.current?.focus();
    }, 100);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolvedBest =
    bestStreak !== undefined ? Math.max(bestStreak, streakDays) : streakDays;
  const hasAchievedNewRecord =
    isNewBest ||
    (bestStreak !== undefined && streakDays >= bestStreak && streakDays > 1);

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="streak-celebration-title"
        onClick={onClose}
      >
        {/* Stable outer container to prevent hover jitter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white border border-[#e5e5e5] p-6 sm:p-8 text-center shadow-2xl text-black my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close streak celebration modal"
            className="absolute top-4 right-4 p-2 text-[#737373] hover:text-black rounded-full hover:bg-black/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Confetti Explosion particles */}
          <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
            {CONFETTI_PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: -40, opacity: 1, scale: 0, rotate: 0 }}
                animate={{
                  x: p.x,
                  y: p.y - 40,
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.2, 1, 0.4],
                  rotate: [0, p.rotate, p.rotate + 180],
                }}
                transition={{
                  duration: 1.2,
                  delay: p.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                style={{
                  position: "absolute",
                  width: `${p.size}px`,
                  height: p.isCircle ? `${p.size}px` : `${p.size * 1.5}px`,
                  borderRadius: p.isCircle ? "9999px" : "2px",
                  backgroundColor: p.color,
                }}
              />
            ))}
          </div>

          {/* Animated Flame Mascot Spotlight */}
          <div className="relative my-4 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.6, rotate: -8 }}
              animate={{ scale: [0.6, 1.1, 1], rotate: [-8, 4, 0] }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <StreakFlame
                streakDays={streakDays}
                tier={flameTier}
                size="xl"
                showEmbers={true}
                showGlow={true}
                isActiveToday={true}
              />
            </motion.div>

            {/* Tier Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${tierInfo.pillBg} ${tierInfo.pillText} ${tierInfo.pillBorder}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tierInfo.titleVi}</span>
              <span className="font-mono opacity-80">
                ({tierInfo.daysRange})
              </span>
            </motion.div>

            {/* Bonus Milestone Freeze Badge */}
            {isFreezeMilestone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                data-testid="milestone-freeze-badge"
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200"
              >
                <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                <span>
                  +1 Streak Freeze Earned! 🧊
                  {streakFreezes !== undefined
                    ? ` (${streakFreezes} held)`
                    : ""}
                </span>
              </motion.div>
            )}
          </div>

          {/* Headline & Celebration Copy */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="space-y-2 mt-3"
          >
            <h2
              id="streak-celebration-title"
              className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {streakDays} Ngày Streak! 🔥
            </h2>

            <p className="text-sm text-[#737373] leading-relaxed max-w-sm mx-auto">
              {message ||
                (hasAchievedNewRecord
                  ? `Xuất sắc! Bạn đã thiết lập kỷ lục chuỗi học tập mới với ${streakDays} ngày liên tiếp!`
                  : `Tuyệt vời! Bạn đã hoàn thành bài học và duy trì ngọn lửa rực sáng hôm nay.`)}
            </p>
          </motion.div>

          {/* Streak Metrics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="grid grid-cols-2 gap-3 my-6"
          >
            {/* Current Streak */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] flex flex-col items-center">
              <span className="text-xs font-medium text-[#737373] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#9333ea]" />
                <span>Chuỗi hiện tại</span>
              </span>
              <span
                className="text-2xl font-extrabold text-black font-mono mt-0.5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {streakDays} ngày
              </span>
            </div>

            {/* Best Streak Record */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] flex flex-col items-center">
              <span className="text-xs font-medium text-[#737373] flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Kỷ lục cao nhất</span>
              </span>
              <span
                className="text-2xl font-extrabold text-black font-mono mt-0.5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {resolvedBest} ngày
              </span>
            </div>
          </motion.div>

          {/* Action CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <button
              ref={primaryButtonRef}
              type="button"
              onClick={onClose}
              className="w-full btn-primary h-12 rounded-full text-sm font-medium gap-2 shadow-xs cursor-pointer justify-center"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <span>Tiếp tục học</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};
