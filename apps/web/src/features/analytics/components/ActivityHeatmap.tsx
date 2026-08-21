import React, { useState } from "react";
import type {
  ActivityHeatmapResponseDto,
  HeatmapDayItemDto,
} from "@wordstreak/shared-types";
import { Flame, Calendar, Info } from "lucide-react";

interface ActivityHeatmapProps {
  data: ActivityHeatmapResponseDto | null;
  isLoading?: boolean;
}

const LEVEL_CLASSES: Record<number, string> = {
  0: "bg-neutral-100 hover:bg-neutral-200 border-neutral-200/80",
  1: "bg-purple-200 hover:bg-purple-300 border-purple-300",
  2: "bg-purple-400 hover:bg-purple-500 border-purple-500",
  3: "bg-purple-600 hover:bg-purple-700 border-purple-700",
  4: "bg-purple-900 hover:bg-black border-purple-950 shadow-sm",
};

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data,
  isLoading = false,
}) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDayItemDto | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  if (isLoading) {
    return (
      <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 sm:p-8 animate-pulse">
        <div className="h-6 w-48 bg-neutral-200 rounded-full mb-6" />
        <div className="h-36 bg-neutral-100 rounded-2xl w-full" />
      </div>
    );
  }

  const days = data?.days || [];

  // Group into 52 weeks (columns) x 7 days (rows)
  // Find day of week of the first item
  const firstDate = days.length > 0 ? new Date(days[0].date) : new Date();
  const startDayOfWeek = firstDate.getDay(); // 0 = Sunday, 1 = Monday...

  // Pad beginning if needed
  const paddedDays: (HeatmapDayItemDto | null)[] = [
    ...Array(startDayOfWeek).fill(null),
    ...days,
  ];

  // Chunk into weeks
  const weeks: (HeatmapDayItemDto | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  const handleMouseEnter = (
    day: HeatmapDayItemDto,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDay(day);
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
    setTooltipPos(null);
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:border-[#d4d4d4]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neutral-800" />
            <h2 className="text-xl font-bold font-['Nunito'] text-black tracking-tight">
              Bản đồ nhiệt độ hoạt động (365 ngày)
            </h2>
          </div>
          <p className="text-sm text-neutral-500 font-['Inter']">
            Tần suất ôn tập từ vựng mỗi ngày trong vòng 52 tuần trượt
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-['JetBrains_Mono'] text-neutral-600 bg-neutral-50 border border-neutral-200/80 px-4 py-2 rounded-full self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-purple-600" />
            <span>
              <strong>{data?.totalReviews || 0}</strong> lượt ôn
            </span>
          </div>
          <span className="text-neutral-300">|</span>
          <div>
            <strong>{data?.activeDaysCount || 0}</strong> ngày hoạt động
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[760px]">
          <div className="flex gap-1.5 items-start">
            {/* Day Labels Column */}
            <div className="flex flex-col gap-1.5 pr-2 pt-0.5 text-[10px] font-['JetBrains_Mono'] text-neutral-400 select-none">
              {DAY_LABELS.map((lbl, idx) => (
                <span key={idx} className="h-3.5 leading-3.5">
                  {idx % 2 === 1 ? lbl : ""}
                </span>
              ))}
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-1.5">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1.5">
                  {week.map((day, dayIdx) => {
                    if (!day) {
                      return (
                        <div key={`empty-${dayIdx}`} className="w-3.5 h-3.5" />
                      );
                    }

                    const levelClass =
                      LEVEL_CLASSES[day.level] || LEVEL_CLASSES[0];

                    return (
                      <div
                        key={day.date}
                        tabIndex={0}
                        aria-label={`${day.count} thẻ đã ôn ngày ${day.date}`}
                        onMouseEnter={(e) => handleMouseEnter(day, e)}
                        onMouseLeave={handleMouseLeave}
                        onFocus={(e) =>
                          handleMouseEnter(
                            day,
                            e as unknown as React.MouseEvent<HTMLDivElement>,
                          )
                        }
                        onBlur={handleMouseLeave}
                        className={`w-3.5 h-3.5 rounded-sm border cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${levelClass}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between text-xs text-neutral-500 font-['Inter'] gap-3">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <Info className="w-3.5 h-3.5" />
          <span>Thời gian hiển thị theo múi giờ thiết bị</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Ít</span>
          <div className="flex gap-1 items-center">
            {[0, 1, 2, 3, 4].map((lvl) => (
              <div
                key={lvl}
                className={`w-3 h-3 rounded-sm border ${LEVEL_CLASSES[lvl]}`}
              />
            ))}
          </div>
          <span>Nhiều</span>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredDay && tooltipPos && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-1.5 bg-neutral-900 text-white text-xs font-['Inter'] rounded-lg shadow-lg border border-neutral-700 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="font-semibold text-white">
            {hoveredDay.count === 0
              ? "Không có lượt ôn tập"
              : `${hoveredDay.count} lượt ôn tập`}
          </div>
          <div className="text-[11px] text-neutral-400 font-['JetBrains_Mono']">
            {formatDateDisplay(hoveredDay.date)}
          </div>
        </div>
      )}
    </div>
  );
};
