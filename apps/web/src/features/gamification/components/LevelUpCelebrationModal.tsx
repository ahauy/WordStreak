import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Crown } from "lucide-react";
import confetti from "canvas-confetti";
import { TierBadgeIcon } from "./TierBadgeIcon";
import {
  TIER_METADATA_CONFIG,
  type LevelUpEventDto,
  type MasteryTier,
} from "@wordstreak/shared-types";

export interface LevelUpCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelUpData?: LevelUpEventDto | null;
  currentLevel?: number;
  currentTier?: MasteryTier | string;
  isTierPromotion?: boolean;
  previousTier?: MasteryTier | string;
}

const TIER_CONFETTI_COLORS: Record<MasteryTier, string[]> = {
  BRONZE: ["#B45309", "#D97706", "#FDE68A", "#ffffff"],
  SILVER: ["#94A3B8", "#E2E8F0", "#64748B", "#ffffff"],
  GOLD: ["#D97706", "#FDE047", "#FEF08A", "#ffffff"],
  DIAMOND: ["#06B6D4", "#A5F3FC", "#ECFEFF", "#ffffff"],
  MASTER: ["#8B5CF6", "#C084FC", "#F3E8FF", "#ffffff"],
};

export const LevelUpCelebrationModal: React.FC<
  LevelUpCelebrationModalProps
> = ({
  isOpen,
  onClose,
  levelUpData,
  currentLevel: propLevel,
  currentTier: propTier,
  isTierPromotion: propIsTierPromo,
  previousTier: propPrevTier,
}) => {
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  const level = levelUpData?.currentLevel ?? propLevel ?? 1;
  const tier = (
    levelUpData?.currentTier ??
    propTier ??
    "BRONZE"
  ).toUpperCase() as MasteryTier;
  const isTierPromotion =
    levelUpData?.isTierPromotion ?? propIsTierPromo ?? false;
  const prevTier = (
    levelUpData?.previousTier ??
    propPrevTier ??
    "BRONZE"
  ).toUpperCase() as MasteryTier;

  const currentTierMeta =
    TIER_METADATA_CONFIG[tier] || TIER_METADATA_CONFIG.BRONZE;
  const prevTierMeta =
    TIER_METADATA_CONFIG[prevTier] || TIER_METADATA_CONFIG.BRONZE;

  // Trigger confetti burst on open
  useEffect(() => {
    if (!isOpen) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion) {
      const colors = TIER_CONFETTI_COLORS[tier] || [
        "#9333ea",
        "#f59e0b",
        "#06b6d4",
        "#ffffff",
      ];

      try {
        confetti({
          particleCount: isTierPromotion ? 100 : 60,
          spread: isTierPromotion ? 90 : 70,
          origin: { y: 0.6 },
          colors,
          zIndex: 9999,
        });
      } catch {
        // Fallback gracefully if canvas is unavailable
      }
    }

    // Auto-focus primary button
    const timer = setTimeout(() => {
      primaryButtonRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, tier, isTierPromotion]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="level-up-title"
        onClick={onClose}
        data-testid="level-up-modal-backdrop"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-950/95 border border-white/10 p-6 sm:p-8 text-center shadow-2xl text-white my-auto backdrop-blur-2xl"
          onClick={(e) => e.stopPropagation()}
          data-testid="level-up-modal"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng chúc mừng lên cấp"
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Glowing Tier Badge Spotlight */}
          <div className="relative my-4 flex flex-col items-center justify-center">
            {/* Ambient Background Aura */}
            <div
              className="absolute w-28 h-28 rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none"
              style={{ backgroundColor: currentTierMeta.colorHex }}
            />

            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: [0.5, 1.15, 1], rotate: [-10, 5, 0] }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              <TierBadgeIcon tier={tier} size="xl" animateGlow />
            </motion.div>

            {/* Tier Promotion Header */}
            {isTierPromotion && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40"
                data-testid="tier-promotion-badge"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  THĂNG HẠNG: {prevTierMeta.nameVi.toUpperCase()} ➔{" "}
                  {currentTierMeta.nameVi.toUpperCase()}!
                </span>
              </motion.div>
            )}
          </div>

          {/* Title & Celebration Copy */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="space-y-2 mt-2"
          >
            <span className="text-xs uppercase tracking-widest font-mono text-purple-400 font-bold">
              Level Up!
            </span>

            <h2
              id="level-up-title"
              className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Cấp Độ {level}! 🎉
            </h2>

            <p className="text-sm text-white/70 leading-relaxed max-w-sm mx-auto">
              {isTierPromotion
                ? `Chúc mừng bạn đã xuất sắc bước lên Hạng ${currentTierMeta.nameVi} (${currentTierMeta.nameEn})! Hãy tiếp tục rèn luyện để vươn tới đỉnh cao.`
                : `Tuyệt vời! Bạn đã tích lũy đủ XP và vươn lên Cấp độ ${level}.`}
            </p>
          </motion.div>

          {/* Level Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 my-6 flex items-center justify-around"
          >
            <div className="flex flex-col items-center">
              <span className="text-xs text-white/50 font-medium">
                Danh hiệu
              </span>
              <span className="text-base font-bold text-white mt-0.5">
                Hạng {currentTierMeta.nameVi}
              </span>
            </div>

            <div className="w-[1px] h-8 bg-white/10" />

            <div className="flex flex-col items-center">
              <span className="text-xs text-white/50 font-medium">
                Cấp độ mới
              </span>
              <span className="text-base font-extrabold text-purple-300 font-mono mt-0.5">
                Lv. {level}
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
              className="w-full h-12 rounded-full bg-white text-black font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all cursor-pointer shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
