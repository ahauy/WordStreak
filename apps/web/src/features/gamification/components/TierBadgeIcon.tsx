import React, { useId } from "react";
import type { MasteryTier } from "@wordstreak/shared-types";
import { TIER_METADATA_CONFIG } from "@wordstreak/shared-types";

export type TierBadgeSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface TierBadgeIconProps {
  tier: MasteryTier | string;
  size?: TierBadgeSize;
  className?: string;
  animateGlow?: boolean;
  showTooltip?: boolean;
}

const SIZE_MAP: Record<
  TierBadgeSize,
  { width: number; height: number; pixelClass: string }
> = {
  xs: { width: 16, height: 16, pixelClass: "w-4 h-4" },
  sm: { width: 20, height: 20, pixelClass: "w-5 h-5" },
  md: { width: 28, height: 28, pixelClass: "w-7 h-7" },
  lg: { width: 40, height: 40, pixelClass: "w-10 h-10" },
  xl: { width: 56, height: 56, pixelClass: "w-14 h-14" },
};

export const TierBadgeIcon: React.FC<TierBadgeIconProps> = ({
  tier,
  size = "md",
  className = "",
  animateGlow = false,
}) => {
  const rawId = useId();
  const id = rawId.replace(/:/g, "_");

  const bronzeGradId = `${id}-bronze-grad`;
  const bronzeRimId = `${id}-bronze-rim`;
  const silverGradId = `${id}-silver-grad`;
  const silverRimId = `${id}-silver-rim`;
  const goldGradId = `${id}-gold-grad`;
  const goldRimId = `${id}-gold-rim`;
  const diamondGradId = `${id}-diamond-grad`;
  const diamondRimId = `${id}-diamond-rim`;
  const masterGradId = `${id}-master-grad`;
  const masterRimId = `${id}-master-rim`;

  const normalizedTier = (
    typeof tier === "string" ? tier.toUpperCase() : "BRONZE"
  ) as MasteryTier;

  const metadata =
    TIER_METADATA_CONFIG[normalizedTier] || TIER_METADATA_CONFIG.BRONZE;

  const { width, height, pixelClass } = SIZE_MAP[size] || SIZE_MAP.md;

  const glowEffectClass = animateGlow
    ? "filter drop-shadow-[0_0_8px_rgba(147,51,234,0.5)] transition-transform duration-300 hover:scale-105"
    : "";

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${pixelClass} ${glowEffectClass} ${className}`}
      role="img"
      aria-label={`${metadata.nameEn} Mastery Tier (${metadata.nameVi})`}
      data-testid={`tier-badge-${normalizedTier.toLowerCase()}`}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full select-none"
      >
        <defs>
          {/* Bronze Gradients */}
          <linearGradient
            id={bronzeGradId}
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient
            id={bronzeRimId}
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          {/* Silver Gradients */}
          <linearGradient
            id={silverGradId}
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient
            id={silverRimId}
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* Gold Gradients */}
          <linearGradient
            id={goldGradId}
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient
            id={goldRimId}
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Diamond Gradients */}
          <linearGradient
            id={diamondGradId}
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#A5F3FC" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0E7490" />
          </linearGradient>
          <linearGradient
            id={diamondRimId}
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ECFEFF" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>

          {/* Master Gradients */}
          <linearGradient
            id={masterGradId}
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#581C87" />
          </linearGradient>
          <linearGradient
            id={masterRimId}
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#F3E8FF" />
            <stop offset="100%" stopColor="#6B21A8" />
          </linearGradient>
        </defs>

        {/* BRONZE CREST */}
        {normalizedTier === "BRONZE" && (
          <g>
            <path
              d="M24 4L40 10V22C40 32.5 33.2 41.8 24 44C14.8 41.8 8 32.5 8 22V10L24 4Z"
              fill={`url(#${bronzeGradId})`}
              stroke={`url(#${bronzeRimId})`}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Inner Emblem */}
            <path
              d="M24 10L35 15V23C35 30.5 30.4 37.3 24 39.2C17.6 37.3 13 30.5 13 23V15L24 10Z"
              fill="#78350F"
              opacity="0.4"
            />
            <path
              d="M24 16L26.5 21.5L32.5 22.2L28 26.2L29.2 32.2L24 29.2L18.8 32.2L20 26.2L15.5 22.2L21.5 21.5L24 16Z"
              fill="#FDE68A"
            />
          </g>
        )}

        {/* SILVER CREST */}
        {normalizedTier === "SILVER" && (
          <g>
            {/* Wings left/right */}
            <path
              d="M4 18C10 14 16 16 20 22C16 26 10 26 4 22V18Z"
              fill={`url(#${silverGradId})`}
              opacity="0.8"
            />
            <path
              d="M44 18C38 14 32 16 28 22C32 26 38 26 44 22V18Z"
              fill={`url(#${silverGradId})`}
              opacity="0.8"
            />
            {/* Central Shield */}
            <path
              d="M24 4L39 11V23C39 33 32.5 41.8 24 44C15.5 41.8 9 33 9 23V11L24 4Z"
              fill={`url(#${silverGradId})`}
              stroke={`url(#${silverRimId})`}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M24 14L30 24L24 34L18 24L24 14Z"
              fill="#FFFFFF"
              stroke="#64748B"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* GOLD CREST */}
        {normalizedTier === "GOLD" && (
          <g>
            <circle
              cx="24"
              cy="24"
              r="20"
              fill={`url(#${goldGradId})`}
              stroke={`url(#${goldRimId})`}
              strokeWidth="2.5"
            />
            {/* Laurel wreath leaves */}
            <path
              d="M12 28C10 24 12 18 16 14C15 18 16 24 20 27"
              stroke="#FEF08A"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M36 28C38 24 36 18 32 14C33 18 32 24 28 27"
              stroke="#FEF08A"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Crown */}
            <path
              d="M16 30L17 21L21 25L24 17L27 25L31 21L32 30H16Z"
              fill="#FEF08A"
              stroke="#78350F"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* DIAMOND CREST */}
        {normalizedTier === "DIAMOND" && (
          <g>
            {/* Diamond Polygon */}
            <path
              d="M24 4L42 16L35 42L24 46L13 42L6 16L24 4Z"
              fill={`url(#${diamondGradId})`}
              stroke={`url(#${diamondRimId})`}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Facets */}
            <path d="M24 4L16 16H32L24 4Z" fill="#ECFEFF" opacity="0.9" />
            <path
              d="M16 16L6 16L13 42L24 46L35 42L42 16L32 16L24 34L16 16Z"
              fill="#0891B2"
              opacity="0.3"
            />
            <path d="M16 16L24 34L32 16H16Z" fill="#A5F3FC" />
          </g>
        )}

        {/* MASTER CREST */}
        {normalizedTier === "MASTER" && (
          <g>
            {/* Outer Royal Hexagon/Shield */}
            <path
              d="M24 3L43 12V28L24 45L5 28V12L24 3Z"
              fill={`url(#${masterGradId})`}
              stroke={`url(#${masterRimId})`}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Mystical Flame / Star Core */}
            <path
              d="M24 12C20 18 16 22 19 28C21 32 24 34 24 34C24 34 27 32 29 28C32 22 28 18 24 12Z"
              fill="#F3E8FF"
              stroke="#6B21A8"
              strokeWidth="1.5"
            />
            <circle cx="24" cy="24" r="3.5" fill="#C084FC" />
          </g>
        )}
      </svg>
    </span>
  );
};
