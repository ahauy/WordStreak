import React from "react";
import { motion } from "framer-motion";
import type { MasteryTier } from "@wordstreak/shared-types";
import { TIER_METADATA_CONFIG } from "@wordstreak/shared-types";

export interface XpProgressBarProps {
  progressPercent: number;
  tier?: MasteryTier | string;
  height?: number | string;
  showLabel?: boolean;
  currentXp?: number;
  requiredXp?: number;
  className?: string;
  animated?: boolean;
}

const TIER_GRADIENTS: Record<MasteryTier, string> = {
  BRONZE: "linear-gradient(90deg, #B45309 0%, #D97706 100%)",
  SILVER: "linear-gradient(90deg, #64748B 0%, #94A3B8 100%)",
  GOLD: "linear-gradient(90deg, #D97706 0%, #F59E0B 100%)",
  DIAMOND: "linear-gradient(90deg, #0891B2 0%, #06B6D4 100%)",
  MASTER: "linear-gradient(90deg, #7E22CE 0%, #A855F7 100%)",
};

export const XpProgressBar: React.FC<XpProgressBarProps> = ({
  progressPercent,
  tier = "BRONZE",
  height = 4,
  showLabel = false,
  currentXp,
  requiredXp,
  className = "",
  animated = true,
}) => {
  const normalizedTier = (
    typeof tier === "string" ? tier.toUpperCase() : "BRONZE"
  ) as MasteryTier;

  const validTier = TIER_METADATA_CONFIG[normalizedTier]
    ? normalizedTier
    : "BRONZE";

  const clampedPercent = Math.min(100, Math.max(0, progressPercent || 0));
  const gradient = TIER_GRADIENTS[validTier] || TIER_GRADIENTS.BRONZE;

  const heightValue = typeof height === "number" ? `${height}px` : height;

  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-[11px] font-mono text-[#737373]">
          <span>
            {currentXp !== undefined && requiredXp !== undefined
              ? `${currentXp.toLocaleString()} / ${requiredXp.toLocaleString()} XP`
              : `${Math.round(clampedPercent)}%`}
          </span>
          <span className="font-semibold text-black">
            {Math.round(clampedPercent)}%
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div
        className="w-full bg-[#f0f0f0] rounded-full overflow-hidden relative"
        style={{ height: heightValue }}
        role="progressbar"
        aria-valuenow={Math.round(clampedPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Level Progress"
      >
        {animated ? (
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${clampedPercent}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ background: gradient }}
            data-testid="xp-progress-bar-fill"
          />
        ) : (
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${clampedPercent}%`, background: gradient }}
            data-testid="xp-progress-bar-fill"
          />
        )}
      </div>
    </div>
  );
};
