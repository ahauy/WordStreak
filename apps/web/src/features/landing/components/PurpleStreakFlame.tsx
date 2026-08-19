import React from "react";

interface PurpleStreakFlameProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showEmbers?: boolean;
}

export const PurpleStreakFlame: React.FC<PurpleStreakFlameProps> = ({
  size = "md",
  className = "",
  showEmbers = true,
}) => {
  const sizeMap = {
    sm: { box: "h-8 w-8", svg: 24, glow: "h-7 w-7" },
    md: { box: "h-14 w-14", svg: 38, glow: "h-12 w-12" },
    lg: { box: "h-20 w-20", svg: 56, glow: "h-16 w-16" },
    xl: { box: "h-28 w-28", svg: 78, glow: "h-24 w-24" },
  };

  const dim = sizeMap[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      {/* Ambient Purple Aura / Glow */}
      <div
        className={`absolute rounded-full bg-gradient-to-t from-[#7e22ce]/40 via-[#9333ea]/30 to-[#c084fc]/20 blur-xl ${dim.glow} pointer-events-none`}
      />

      {/* Burning Purple Flame Container */}
      <div className={`purple-flame-container ${dim.box}`}>
        {/* Floating Ember Particles */}
        {showEmbers && (
          <>
            <span className="flame-ember-1" />
            <span className="flame-ember-2" />
          </>
        )}

        {/* Layered Burning Flame SVG */}
        <svg
          width={dim.svg}
          height={dim.svg}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <defs>
            {/* Outer Burning Violet Flame Gradient */}
            <linearGradient
              id="purpleFlameOuter"
              x1="24"
              y1="44"
              x2="24"
              y2="4"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#4c1d95" />
              <stop offset="35%" stopColor="#7e22ce" />
              <stop offset="70%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>

            {/* Inner Electric Core Flame Gradient */}
            <linearGradient
              id="purpleFlameInner"
              x1="24"
              y1="40"
              x2="24"
              y2="16"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="40%" stopColor="#c084fc" />
              <stop offset="85%" stopColor="#e9d5ff" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            {/* Core Hotspot Gradient */}
            <linearGradient
              id="purpleFlameHotspot"
              x1="24"
              y1="38"
              x2="24"
              y2="24"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>

          {/* Outer Flame Tongue (Dancing) */}
          <path
            d="M24 4C24 4 11 16 11 28C11 35.1797 16.8203 41 24 41C31.1797 41 37 35.1797 37 28C37 18 29.5 12 29.5 12C29.5 12 30.5 17.5 28 20C25.5 22.5 23 20 23 16C23 10.5 24 4 24 4Z"
            fill="url(#purpleFlameOuter)"
            className="purple-flame-core"
          />

          {/* Secondary Flickering Side Tongue */}
          <path
            d="M24 10C24 10 16 18 16 27C16 32.5 20 37 24 37C28 37 32 32.5 32 27C32 20 28 15 28 15C28 15 27 18 25.5 19C24 20 24 16 24 10Z"
            fill="url(#purpleFlameInner)"
            className="purple-flame-inner"
            opacity="0.95"
          />

          {/* Inner Bright Hotspot Core */}
          <path
            d="M24 22C24 22 20 26 20 30.5C20 33.5 21.8 36 24 36C26.2 36 28 33.5 28 30.5C28 26.5 26 24 26 24C26 24 25.5 25.5 24.8 25.5C24 25.5 24 24 24 22Z"
            fill="url(#purpleFlameHotspot)"
            className="purple-flame-inner"
          />
        </svg>
      </div>
    </div>
  );
};
