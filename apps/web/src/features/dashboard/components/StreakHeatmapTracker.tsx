import React, { useState, useMemo } from "react";
import { TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { PurpleStreakFlame } from "../../landing/components/PurpleStreakFlame";
import type { ActivityHeatmapResponseDto } from "@wordstreak/shared-types";

interface HeatmapCell {
  week: number;
  day: number;
  level: number; // 0 to 4
  reviews: number;
  dateStr: string;
}

interface StreakHeatmapTrackerProps {
  heatmapData?: ActivityHeatmapResponseDto | null;
  isLoading?: boolean;
  currentStreak?: number;
  longestStreak?: number;
}

export const StreakHeatmapTracker: React.FC<StreakHeatmapTrackerProps> = ({
  heatmapData = null,
  isLoading = false,
  currentStreak = 0,
}) => {
  const { t, i18n } = useTranslation(["dashboard", "common"]);
  const [activeCell, setActiveCell] = useState<HeatmapCell | null>(null);

  const totalWeeks = 18;
  const daysPerWeek = 7;

  // Build 18-week heatmap data from real ActivityHeatmapResponseDto
  const { weeksData, totalReviews, activeDaysCount } = useMemo(() => {
    const weeks: HeatmapCell[][] = [];

    // Create a fast lookup map for real backend days (keyed by YYYY-MM-DD)
    const dayMap = new Map<string, { count: number; level: number }>();
    if (heatmapData?.days) {
      for (const item of heatmapData.days) {
        dayMap.set(item.date, { count: item.count, level: item.level });
      }
    }

    const today = new Date();
    // Compute total days in 18 weeks (126 days), ending today
    const totalDays = totalWeeks * daysPerWeek;

    for (let w = 0; w < totalWeeks; w++) {
      const week: HeatmapCell[] = [];
      for (let d = 0; d < daysPerWeek; d++) {
        // Calculate the specific calendar date for this cell
        const daysAgo = totalDays - 1 - (w * daysPerWeek + d);
        const cellDate = new Date(today);
        cellDate.setDate(today.getDate() - daysAgo);

        const yyyy = cellDate.getFullYear();
        const mm = String(cellDate.getMonth() + 1).padStart(2, "0");
        const dd = String(cellDate.getDate()).padStart(2, "0");
        const dateKey = `${yyyy}-${mm}-${dd}`;

        const realDay = dayMap.get(dateKey);
        const level = realDay ? realDay.level : 0;
        const reviews = realDay ? realDay.count : 0;

        const dateStr = cellDate.toLocaleDateString(
          i18n.language === "vi" ? "vi-VN" : "en-US",
          {
            weekday: "short",
            month: "numeric",
            day: "numeric",
          },
        );

        week.push({
          week: w,
          day: d,
          level,
          reviews,
          dateStr,
        });
      }
      weeks.push(week);
    }

    return {
      weeksData: weeks,
      totalReviews: heatmapData?.totalReviews || 0,
      activeDaysCount: heatmapData?.activeDaysCount || 0,
    };
  }, [heatmapData, totalWeeks, daysPerWeek, i18n.language]);

  const getCellColor = (level: number, isHovered: boolean) => {
    if (isHovered) {
      return "bg-[#7e22ce] ring-2 ring-[#9333ea] shadow-md shadow-[#9333ea]/30 scale-125 z-20";
    }

    switch (level) {
      case 0:
        return "bg-[#fafafa] border border-[#e5e5e5]";
      case 1:
        return "bg-[#f3e8ff] border border-[#e9d5ff]";
      case 2:
        return "bg-[#d8b4fe] border border-[#c084fc]";
      case 3:
        return "bg-[#a855f7] border border-[#9333ea]";
      case 4:
        return "bg-[#7e22ce] border border-[#6b21a8] shadow-xs";
      default:
        return "bg-[#fafafa]";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-xs space-y-6"
    >
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0f0f0] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e9d5ff] bg-[#f3e8ff] px-3 py-1 mb-2 text-[#7e22ce]">
            <PurpleStreakFlame
              size="sm"
              showEmbers={false}
              className="w-3.5 h-3.5"
            />
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              {t("heatmap.badge", "Streak & Habit Tracker")}
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl font-bold text-black tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("heatmap.title", "Streak & Review Activity Log")}
          </h2>
          <p className="text-xs sm:text-sm text-[#737373] mt-0.5">
            {t(
              "heatmap.subtitle",
              "Track your daily study consistency and spaced repetition retention momentum.",
            )}
          </p>
        </div>

        {/* Quick Milestone Badge */}
        <div className="flex items-center gap-3 bg-[#fafafa] border border-[#e5e5e5] rounded-2xl px-4 py-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#f3e8ff] text-[#7e22ce] border border-[#e9d5ff] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#737373]">
              {t("heatmap.nextMilestone", "Next Milestone")}
            </div>
            <div className="text-xs font-bold text-black flex items-center gap-1">
              <span>{t("heatmap.milestoneBadge", "7-Day Streak Badge")}</span>
              <span className="text-[#7e22ce] font-mono">
                ({currentStreak}/7d)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Heatmap Matrix */}
      {isLoading ? (
        <div className="h-32 bg-[#fafafa] rounded-2xl animate-pulse" />
      ) : (
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="flex gap-1.5 min-w-[500px] justify-between">
            {weeksData.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5 flex-1">
                {week.map((cell) => {
                  const isHovered =
                    activeCell?.week === cell.week &&
                    activeCell?.day === cell.day;

                  return (
                    <div
                      key={`${cell.week}-${cell.day}`}
                      onMouseEnter={() => setActiveCell(cell)}
                      onMouseLeave={() => setActiveCell(null)}
                      className={`h-4 w-full rounded-xs transition-all duration-150 cursor-pointer ${getCellColor(
                        cell.level,
                        isHovered,
                      )}`}
                      title={`${cell.dateStr}: ${
                        cell.reviews === 0
                          ? t("heatmap.emptyReviews", "No reviews")
                          : t("heatmap.cardReviews", {
                              count: cell.reviews,
                              defaultValue: `${cell.reviews} reviews`,
                            })
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heatmap Footer / Metrics / Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-[#f0f0f0] text-xs text-[#737373]">
        {/* Dynamic Tooltip Summary */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#16a34a]" />
          {activeCell ? (
            <span className="text-black font-medium">
              {activeCell.dateStr}:{" "}
              <strong className="text-[#7e22ce]">
                {activeCell.reviews === 0
                  ? t("heatmap.emptyReviews", "No reviews")
                  : t("heatmap.cardReviews", {
                      count: activeCell.reviews,
                      defaultValue: `${activeCell.reviews} reviews`,
                    })}
              </strong>
            </span>
          ) : totalReviews === 0 ? (
            <span className="text-neutral-500 font-medium">
              {t(
                "heatmap.emptyHistory",
                "No reviews recorded yet. Start your first session to log activity!",
              )}
            </span>
          ) : (
            <span className="text-black font-medium">
              {t("heatmap.completedSummary", {
                total: totalReviews,
                days: activeDaysCount,
                defaultValue: `Completed ${totalReviews} cards across ${activeDaysCount} active days`,
              })}
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px]">
          <span>{t("heatmap.less", "Less")}</span>
          <div className="w-3.5 h-3.5 rounded-xs bg-[#fafafa] border border-[#e5e5e5]" />
          <div className="w-3.5 h-3.5 rounded-xs bg-[#f3e8ff] border border-[#e9d5ff]" />
          <div className="w-3.5 h-3.5 rounded-xs bg-[#d8b4fe]" />
          <div className="w-3.5 h-3.5 rounded-xs bg-[#a855f7]" />
          <div className="w-3.5 h-3.5 rounded-xs bg-[#7e22ce]" />
          <span>{t("heatmap.more", "More")}</span>
        </div>
      </div>
    </motion.div>
  );
};
