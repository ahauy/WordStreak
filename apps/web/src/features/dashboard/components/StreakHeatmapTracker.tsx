import React, { useState, useMemo } from "react";
import { TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import { PurpleStreakFlame } from "../../landing/components/PurpleStreakFlame";

interface HeatmapCell {
  week: number;
  day: number;
  level: number; // 0 to 4
  reviews: number;
  dateStr: string;
}

interface StreakHeatmapTrackerProps {
  currentStreak?: number;
  longestStreak?: number;
}

export const StreakHeatmapTracker: React.FC<StreakHeatmapTrackerProps> = ({
  currentStreak = 0,
}) => {
  const [activeCell, setActiveCell] = useState<HeatmapCell | null>(null);

  const totalWeeks = 18;
  const daysPerWeek = 7;

  // Generate realistic, deterministic activity data for recent weeks
  const { weeksData, totalReviews, activeDaysCount } = useMemo(() => {
    const weeks: HeatmapCell[][] = [];
    let reviewsCount = 0;
    let activeDays = 0;

    for (let w = 0; w < totalWeeks; w++) {
      const week: HeatmapCell[] = [];
      for (let d = 0; d < daysPerWeek; d++) {
        // Pseudo-random distribution based on week & day
        const seed = (w * 19 + d * 11 + 7) % 100;
        let level = 0;
        let reviews = 0;

        // More activity in recent weeks
        if (w >= totalWeeks - 4) {
          if (seed > 30) {
            level = seed > 75 ? 4 : seed > 50 ? 3 : 2;
            reviews = level * 6 + (seed % 8);
          }
        } else if (seed > 55) {
          level = seed > 80 ? 3 : seed > 68 ? 2 : 1;
          reviews = level * 5 + (seed % 5);
        }

        if (level > 0) {
          activeDays++;
          reviewsCount += reviews;
        }

        const date = new Date();
        date.setDate(
          date.getDate() - ((totalWeeks - 1 - w) * 7 + (daysPerWeek - 1 - d)),
        );
        const dateStr = date.toLocaleDateString("vi-VN", {
          weekday: "short",
          month: "numeric",
          day: "numeric",
        });

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
      totalReviews: reviewsCount,
      activeDaysCount: activeDays,
    };
  }, [totalWeeks, daysPerWeek]);

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
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Streak & Habit Tracker
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl font-bold text-black tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Nhật ký duy trì Streak & Ôn tập
          </h2>
          <p className="text-xs sm:text-sm text-[#737373] mt-0.5">
            Theo dõi mật độ học và chuỗi ngày rèn luyện trí nhớ không ngắt
            quãng.
          </p>
        </div>

        {/* Quick Milestone Badge */}
        <div className="flex items-center gap-3 bg-[#fafafa] border border-[#e5e5e5] rounded-2xl px-4 py-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#f3e8ff] text-[#7e22ce] border border-[#e9d5ff] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#737373]">Mục tiêu tiếp theo</div>
            <div className="text-xs font-bold text-black flex items-center gap-1">
              <span>Huy hiệu 7 ngày</span>
              <span className="text-[#7e22ce] font-mono">
                ({currentStreak}/7d)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Heatmap Matrix */}
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
                    title={`${cell.dateStr}: ${cell.reviews} thẻ ôn tập`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Footer / Metrics / Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-[#f0f0f0] text-xs text-[#737373]">
        {/* Dynamic Tooltip Summary */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#16a34a]" />
          {activeCell ? (
            <span className="text-black font-medium">
              {activeCell.dateStr}:{" "}
              <strong className="text-[#7e22ce]">
                {activeCell.reviews} thẻ ôn tập
              </strong>
            </span>
          ) : (
            <span className="text-black font-medium">
              Đã hoàn thành{" "}
              <strong className="text-[#7e22ce]">{totalReviews} thẻ</strong> qua{" "}
              <strong className="text-black">{activeDaysCount} ngày</strong> ôn
              tập
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px]">
          <span>Ít hơn</span>
          <div className="w-3.5 h-3.5 rounded-xs bg-[#fafafa] border border-[#e5e5e5]" />
          <div className="w-3.5 h-3.5 rounded-xs bg-[#f3e8ff] border border-[#e9d5ff]" />
          <div className="w-3.5 h-3.5 rounded-xs bg-[#d8b4fe]" />
          <div className="w-3.5 h-3.5 rounded-xs bg-[#a855f7]" />
          <div className="w-3.5 h-3.5 rounded-xs bg-[#7e22ce]" />
          <span>Nhiều hơn</span>
        </div>
      </div>
    </motion.div>
  );
};
