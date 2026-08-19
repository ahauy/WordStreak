import React, { useState, useMemo } from "react";
import { Flame, TrendingUp, Award } from "lucide-react";

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
      return "bg-[#ffb940] ring-2 ring-[#f5a623] shadow-md shadow-[#f5a623]/80 scale-125 z-20";
    }

    switch (level) {
      case 0:
        return "bg-white/[0.04] border border-white/5";
      case 1:
        return "bg-[#78350f]/80 border border-[#92400e]/40";
      case 2:
        return "bg-[#b45309] border border-[#d97706]/50";
      case 3:
        return "bg-[#d97706] border border-[#f59e0b]";
      case 4:
        return "bg-[#f5a623] border border-[#fbbf24] shadow-sm shadow-[#f5a623]/40";
      default:
        return "bg-white/[0.04]";
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1526]/75 p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3 py-1 mb-2">
            <Flame className="w-3.5 h-3.5 text-[#f5a623] fill-[#f5a623]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5a623]">
              Streak & Habit Tracker
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Nhật ký duy trì Streak & Ôn tập
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8] mt-0.5">
            Theo dõi mật độ học và chuỗi ngày rèn luyện trí nhớ không ngắt
            quãng.
          </p>
        </div>

        {/* Quick Milestone Badge */}
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f5a623] to-[#ffb940] flex items-center justify-center text-[#060e1a] font-bold shadow-md shadow-[#f5a623]/25">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#94a3b8]">Mục tiêu tiếp theo</div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <span>Huy hiệu 7 ngày</span>
              <span className="text-[#f5a623] font-mono">
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
                    className={`h-4 w-full rounded-xs transition-all duration-200 cursor-pointer ${getCellColor(
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-white/5 text-xs text-[#94a3b8]">
        {/* Dynamic Tooltip Summary */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#30d158]" />
          {activeCell ? (
            <span className="text-white font-medium">
              {activeCell.dateStr}:{" "}
              <strong className="text-[#f5a623]">
                {activeCell.reviews} thẻ ôn tập
              </strong>
            </span>
          ) : (
            <span className="text-white font-medium">
              Đã hoàn thành{" "}
              <strong className="text-[#f5a623]">{totalReviews} thẻ</strong> qua{" "}
              <strong className="text-white">{activeDaysCount} ngày</strong> ôn
              tập
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px]">
          <span>Ít hơn</span>
          <div className="w-3.5 h-3.5 rounded-xs bg-white/[0.04] border border-white/5" />
          <div className="w-3.5 h-3.5 rounded-xs bg-[#78350f]/80" />
          <div className="w-3.5 h-3.5 rounded-xs bg-[#b45309]" />
          <div className="w-3.5 h-3.5 rounded-xs bg-[#d97706]" />
          <div className="w-3.5 h-3.5 rounded-xs bg-[#f5a623] shadow-xs shadow-[#f5a623]/50" />
          <span>Nhiều hơn</span>
        </div>
      </div>
    </div>
  );
};
