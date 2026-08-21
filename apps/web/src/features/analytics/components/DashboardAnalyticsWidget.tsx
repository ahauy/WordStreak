import React from "react";
import { Link } from "react-router-dom";
import type { AnalyticsOverviewDto } from "@wordstreak/shared-types";
import { BarChart3, ArrowRight, Award, Target } from "lucide-react";

interface DashboardAnalyticsWidgetProps {
  overview: AnalyticsOverviewDto | null;
  isLoading?: boolean;
}

export const DashboardAnalyticsWidget: React.FC<
  DashboardAnalyticsWidgetProps
> = ({ overview, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 shadow-sm animate-pulse">
        <div className="h-5 w-40 bg-neutral-200 rounded-full mb-4" />
        <div className="h-3.5 w-full bg-neutral-100 rounded-full mb-4" />
        <div className="h-10 bg-neutral-100 rounded-2xl" />
      </div>
    );
  }

  const mastery = overview?.masterySummary;
  const total = mastery?.totalCards || 0;
  const mastered = mastery?.masteredCount || 0;
  const learning = mastery?.learningCount || 0;
  const newCards = mastery?.newCount || 0;

  const masteredPct = mastery?.masteredPercentage || 0;
  const learningPct = mastery?.learningPercentage || 0;
  const newPct = mastery?.newPercentage || 0;

  const retention = overview?.retentionRate30Days;

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 shadow-sm transition-all hover:border-[#d4d4d4] flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neutral-800" />
            <h3 className="font-bold text-lg font-['Nunito'] text-black">
              Thống kê học tập & Trí nhớ
            </h3>
          </div>
          <Link
            to="/analytics"
            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 font-['Inter'] group"
          >
            <span>Xem chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Progress Bar */}
        {total > 0 ? (
          <div className="space-y-3">
            <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-neutral-200/80">
              {mastered > 0 && (
                <div
                  style={{ width: `${masteredPct}%` }}
                  className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                />
              )}
              {learning > 0 && (
                <div
                  style={{ width: `${learningPct}%` }}
                  className={`h-full bg-indigo-500 transition-all duration-500 ${
                    mastered === 0 ? "rounded-l-full" : ""
                  } ${newCards === 0 ? "rounded-r-full" : ""}`}
                />
              )}
              {newCards > 0 && (
                <div
                  style={{ width: `${newPct}%` }}
                  className="h-full bg-slate-400 rounded-r-full transition-all duration-500"
                />
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl py-2 px-1">
                <div className="text-xs font-bold text-emerald-800 font-['Nunito']">
                  {mastered}
                </div>
                <div className="text-[10px] text-emerald-600 font-['Inter']">
                  Thành thạo ({masteredPct}%)
                </div>
              </div>

              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl py-2 px-1">
                <div className="text-xs font-bold text-indigo-800 font-['Nunito']">
                  {learning}
                </div>
                <div className="text-[10px] text-indigo-600 font-['Inter']">
                  Đang học ({learningPct}%)
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-1">
                <div className="text-xs font-bold text-slate-800 font-['Nunito']">
                  {newCards}
                </div>
                <div className="text-[10px] text-slate-500 font-['Inter']">
                  Từ mới ({newPct}%)
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-neutral-400 font-['Inter']">
            Chưa có thẻ từ vựng. Bắt đầu học để ghi nhận số liệu.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-['Inter']">
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-purple-600" />
          <span>
            Tỷ lệ nhớ 30 ngày:{" "}
            <strong className="text-black font-['JetBrains_Mono']">
              {retention !== null && retention !== undefined
                ? `${retention}%`
                : "Chưa có"}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1 text-neutral-400">
          <Award className="w-3.5 h-3.5" />
          <span>SM-2 Engine</span>
        </div>
      </div>
    </div>
  );
};
