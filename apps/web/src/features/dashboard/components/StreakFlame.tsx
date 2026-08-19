import React from "react";
import { motion } from "framer-motion";
import {
  FLAME_TIERS,
  getFlameTier,
  type FlameTierInfo,
} from "../config/flameTiers";

interface StreakFlameProps {
  streakDays?: number;
  tier?: number;
  customTierInfo?: FlameTierInfo;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showEmbers?: boolean;
  showGlow?: boolean;
}

const SPARK_CONFIGS = [
  { x: [-1, -6, -12], y: [0, -18, -42], size: 3, duration: 1.3, delay: 0.1 },
  { x: [1, 7, 14], y: [0, -22, -48], size: 2.5, duration: 1.5, delay: 0.4 },
  { x: [0, -3, -6], y: [0, -28, -58], size: 3.5, duration: 1.2, delay: 0.75 },
  { x: [2, 5, 9], y: [0, -16, -38], size: 2, duration: 1.4, delay: 0.25 },
  { x: [-2, 4, -8], y: [0, -32, -64], size: 2.8, duration: 1.7, delay: 0.9 },
  { x: [1, -5, 3], y: [0, -24, -50], size: 2.2, duration: 1.35, delay: 0.55 },
];

export const StreakFlame: React.FC<StreakFlameProps> = ({
  streakDays = 0,
  tier: explicitTier,
  customTierInfo,
  size = "md",
  className = "",
  showEmbers = true,
  showGlow = true,
}) => {
  const tierInfo =
    customTierInfo !== undefined
      ? customTierInfo
      : explicitTier !== undefined
        ? FLAME_TIERS[
            Math.min(Math.max(explicitTier, 0), FLAME_TIERS.length - 1)
          ]
        : getFlameTier(streakDays);

  const sizeMap = {
    xs: { box: "h-5 w-5", svg: 16, glow: "h-5 w-5" },
    sm: { box: "h-8 w-8", svg: 24, glow: "h-7 w-7" },
    md: { box: "h-14 w-14", svg: 38, glow: "h-12 w-12" },
    lg: { box: "h-20 w-20", svg: 56, glow: "h-16 w-16" },
    xl: { box: "h-28 w-28", svg: 78, glow: "h-24 w-24" },
  };

  const dim = sizeMap[size];
  const gradId = `flameGrad-${tierInfo.tier}-${size}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      title={`${tierInfo.titleVi} (${tierInfo.daysRange})`}
    >
      {/* Ambient Aura / Glow */}
      {showGlow && (
        <div
          className={`absolute rounded-full bg-gradient-to-t ${tierInfo.glowColor} blur-xl ${dim.glow} pointer-events-none`}
        />
      )}

      {/* Flame Container */}
      <div className={`purple-flame-container ${dim.box}`}>
        {/* Dynamic Flying Ember Sparks */}
        {showEmbers && tierInfo.tier > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {SPARK_CONFIGS.map((spark, i) => (
              <motion.span
                key={i}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                  scale: 0.6,
                }}
                animate={{
                  x: spark.x,
                  y: spark.y,
                  opacity: [0, 1, 0.9, 0],
                  scale: [0.6, 1.2, 0.5, 0],
                }}
                transition={{
                  duration: spark.duration,
                  delay: spark.delay,
                  repeat: Infinity,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                style={{
                  position: "absolute",
                  top: "20%",
                  left: "48%",
                  width: `${spark.size}px`,
                  height: `${spark.size}px`,
                  borderRadius: "9999px",
                  backgroundColor:
                    i % 2 === 0
                      ? tierInfo.outerGradient[3]
                      : tierInfo.outerGradient[2],
                  boxShadow: `0 0 6px ${tierInfo.outerGradient[2]}, 0 0 2px #ffffff`,
                }}
              />
            ))}
          </div>
        )}

        {/* SVG Layered Flame */}
        <svg
          width={dim.svg}
          height={dim.svg}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <defs>
            {/* Outer Burning Gradient */}
            <linearGradient
              id={`${gradId}-outer`}
              x1="24"
              y1="44"
              x2="24"
              y2="4"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={tierInfo.outerGradient[0]} />
              <stop offset="35%" stopColor={tierInfo.outerGradient[1]} />
              <stop offset="70%" stopColor={tierInfo.outerGradient[2]} />
              <stop offset="100%" stopColor={tierInfo.outerGradient[3]} />
            </linearGradient>

            {/* Inner Core Flame Gradient */}
            <linearGradient
              id={`${gradId}-inner`}
              x1="24"
              y1="40"
              x2="24"
              y2="16"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={tierInfo.innerGradient[0]} />
              <stop offset="40%" stopColor={tierInfo.innerGradient[1]} />
              <stop offset="85%" stopColor={tierInfo.innerGradient[2]} />
              <stop offset="100%" stopColor={tierInfo.innerGradient[3]} />
            </linearGradient>

            {/* Hotspot Center */}
            <linearGradient
              id={`${gradId}-hotspot`}
              x1="24"
              y1="38"
              x2="24"
              y2="24"
              gradientUnits="userSpaceOnUse"
            >
              <stop
                offset="0%"
                stopColor={tierInfo.innerGradient[2]}
                stopOpacity="0.8"
              />
              <stop offset="100%" stopColor={tierInfo.hotspotColor} />
            </linearGradient>
          </defs>

          {/* Outer Dancing Flame Tongue */}
          <path
            d="M24 4C24 4 11 16 11 28C11 35.1797 16.8203 41 24 41C31.1797 41 37 35.1797 37 28C37 18 29.5 12 29.5 12C29.5 12 30.5 17.5 28 20C25.5 22.5 23 20 23 16C23 10.5 24 4 24 4Z"
            fill={`url(#${gradId}-outer)`}
            className="purple-flame-core"
          />

          {/* Secondary Flickering Tongue */}
          <path
            d="M24 10C24 10 16 18 16 27C16 32.5 20 37 24 37C28 37 32 32.5 32 27C32 20 28 15 28 15C28 15 27 18 25.5 19C24 20 24 16 24 10Z"
            fill={`url(#${gradId}-inner)`}
            className="purple-flame-inner"
            opacity="0.95"
          />

          {/* Inner Hotspot Core */}
          <path
            d="M24 22C24 22 20 26 20 30.5C20 33.5 21.8 36 24 36C26.2 36 28 33.5 28 30.5C28 26.5 26 24 26 24C26 24 25.5 25.5 24.8 25.5C24 25.5 24 24 24 22Z"
            fill={`url(#${gradId}-hotspot)`}
            className="purple-flame-inner"
          />
        </svg>
      </div>
    </div>
  );
};
