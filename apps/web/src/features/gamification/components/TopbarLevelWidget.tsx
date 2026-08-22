import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  History,
  ChevronRight,
  Award,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useXpSummary } from "../hooks/useXpSummary";
import { TierBadgeIcon } from "./TierBadgeIcon";
import { XpProgressBar } from "./XpProgressBar";

export interface TopbarLevelWidgetProps {
  onOpenHistory?: () => void;
  className?: string;
}

export const TopbarLevelWidget: React.FC<TopbarLevelWidgetProps> = ({
  onOpenHistory,
  className = "",
}) => {
  const { t, i18n } = useTranslation(["gamification", "common"]);
  const {
    summary,
    level,
    tier,
    totalXp,
    currentLevelXp,
    nextLevelRequiredXp,
    progressPercent,
    todayXp,
    nextTier,
    nextTierLevel,
    tierMetadata,
    isLoading,
    error,
    refetch,
  } = useXpSummary();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  // UX State 1: Loading skeleton
  if (isLoading && !summary) {
    return (
      <div
        className={`h-9 px-3 rounded-full border border-[#e5e5e5] bg-[#fafafa] animate-pulse flex items-center gap-2 ${className}`}
        data-testid="topbar-level-loading"
        aria-busy="true"
        aria-label={t("widget.loading", "Loading level data...")}
      >
        <div className="w-4 h-4 rounded-full bg-[#e5e5e5]" />
        <div className="w-10 h-3 rounded-full bg-[#e5e5e5]" />
        <div className="w-6 h-1.5 rounded-full bg-[#e5e5e5]" />
      </div>
    );
  }

  // UX State 2: Error state
  if (error && !summary) {
    return (
      <button
        type="button"
        onClick={() => refetch()}
        className={`h-9 px-3 rounded-full border border-[#ff5f56]/30 bg-[#fff5f5] text-[#dc2626] text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#ffebeb] transition-colors ${className}`}
        title="Lỗi tải XP. Nhấn để thử lại."
        data-testid="topbar-level-error"
      >
        <Award className="w-3.5 h-3.5" />
        <span>{t("widget.retry", "Retry")}</span>
      </button>
    );
  }

  const isVi = i18n.language === "vi";
  const tierName = isVi
    ? tierMetadata?.nameVi || "Đồng"
    : tierMetadata?.nameEn || "Bronze";
  const xpRemaining = Math.max(0, nextLevelRequiredXp - currentLevelXp);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Stable outer pill trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`${t("widget.levelLabel", { level, defaultValue: `Level ${level}` })}, ${t("widget.tierRank", { tier: tierName, defaultValue: `Tier ${tierName}` })}, ${totalXp} XP`}
        data-testid="topbar-level-pill"
        className="h-9 px-2.5 sm:px-3 rounded-full border border-[#e5e5e5] bg-white hover:bg-[#fafafa] hover:border-[#d4d4d4] transition-all flex items-center gap-2 cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 apple-tap-active"
      >
        {/* Tier Crest Icon */}
        <TierBadgeIcon tier={tier} size="sm" />

        {/* Level text */}
        <span
          className="text-xs font-extrabold text-black tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Lv. {level}
        </span>

        {/* Mini progress bar */}
        <div className="w-7 sm:w-9 hidden xs:block">
          <XpProgressBar
            progressPercent={progressPercent}
            tier={tier}
            height={3.5}
            animated={false}
          />
        </div>
      </button>

      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#e5e5e5] shadow-xl p-4 z-50 text-black text-left focus:outline-none"
            role="dialog"
            aria-label={t("widget.levelProgress", "Level Progress")}
            data-testid="topbar-level-popover"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-3">
              <div className="flex items-center gap-2.5">
                <TierBadgeIcon tier={tier} size="lg" animateGlow />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4
                      className="text-sm font-extrabold text-black"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {t("widget.tierRank", {
                        tier: tierName,
                        defaultValue: `Tier ${tierName}`,
                      })}
                    </h4>
                  </div>
                  <p className="text-xs font-semibold text-[#7e22ce]">
                    {t("widget.levelLabel", {
                      level,
                      defaultValue: `Level ${level}`,
                    })}
                  </p>
                </div>
              </div>

              {/* Today's XP badge */}
              <div className="text-right">
                <span className="text-[10px] font-medium text-[#737373] block">
                  {t("widget.today", "Today")}
                </span>
                <span className="text-xs font-bold text-[#16a34a] font-mono">
                  +{todayXp} XP
                </span>
              </div>
            </div>

            {/* Level Progress Section */}
            <div className="py-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#737373] font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#9333ea]" />
                  <span>{t("widget.levelProgress", "Level Progress")}</span>
                </span>
                <span className="font-mono font-bold text-black text-xs">
                  {currentLevelXp} / {nextLevelRequiredXp} XP
                </span>
              </div>

              <XpProgressBar
                progressPercent={progressPercent}
                tier={tier}
                height={6}
                showLabel={false}
              />

              <p className="text-[11px] text-[#737373] flex items-center justify-between">
                <span>
                  {t("widget.remainingToNext", {
                    remaining: xpRemaining,
                    next: level + 1,
                    defaultValue: `${xpRemaining} XP remaining to Lv. ${level + 1}`,
                  })}
                </span>
                <span className="font-mono font-semibold text-black">
                  {Math.round(progressPercent)}%
                </span>
              </p>
            </div>

            {/* Next Tier Milestone Banner */}
            {nextTier && nextTierLevel && (
              <div className="p-2.5 rounded-xl bg-[#fafafa] border border-[#e5e5e5] flex items-center gap-2 text-xs text-[#525252] mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                <span className="leading-tight">
                  {t("widget.nextTierUnlock", {
                    tier: nextTier,
                    level: nextTierLevel,
                    remaining: nextTierLevel - level,
                    defaultValue: `Unlock Tier ${nextTier} at Lv. ${nextTierLevel} (${nextTierLevel - level} levels left).`,
                  })}
                </span>
              </div>
            )}

            {/* Lifetime Total XP & Activity CTA */}
            <div className="pt-2 border-t border-[#f0f0f0] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#737373] block uppercase tracking-wider">
                  {t("widget.totalXp", "Total XP")}
                </span>
                <span className="text-sm font-extrabold text-black font-mono">
                  {totalXp.toLocaleString()} XP
                </span>
              </div>

              {onOpenHistory && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenHistory();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-black hover:bg-[#fafafa] border border-[#e5e5e5] hover:border-[#d4d4d4] transition-all cursor-pointer"
                >
                  <History className="w-3 h-3 text-[#7e22ce]" />
                  <span>{t("widget.viewHistory", "View History")}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
