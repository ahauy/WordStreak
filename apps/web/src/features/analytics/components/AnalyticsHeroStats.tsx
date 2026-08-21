import React from "react";
import type { AnalyticsOverviewDto } from "@wordstreak/shared-types";
import { Target, RotateCcw, Flame, CheckCircle2 } from "lucide-react";

interface AnalyticsHeroStatsProps {
  data: AnalyticsOverviewDto | null;
  isLoading?: boolean;
}

export const AnalyticsHeroStats: React.FC<AnalyticsHeroStatsProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
        <div className="h-28 bg-neutral-100 rounded-3xl border border-[#e5e5e5]" />
        <div className="h-28 bg-neutral-100 rounded-3xl border border-[#e5e5e5]" />
        <div className="h-28 bg-neutral-100 rounded-3xl border border-[#e5e5e5]" />
      </div>
    );
  }

  const retention = data?.retentionRate30Days;
  const totalReviews = data?.totalReviewsLogged || 0;
  const currentStreak = data?.currentStreak || 0;
  const bestStreak = data?.bestStreak || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 30-Day Retention Rate */}
      <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 shadow-sm transition-all hover:border-[#d4d4d4] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 font-['Inter'] uppercase tracking-wider">
            Tỷ lệ nhớ 30 ngày
          </span>
          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold font-['Nunito'] text-black flex items-baseline gap-1.5">
            {retention !== null && retention !== undefined ? (
              <>
                <span>{retention}%</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </>
            ) : (
              <span className="text-xl text-neutral-400 font-['Inter'] font-normal">
                Chưa có dữ liệu
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 font-['Inter'] mt-1">
            Đánh giá Good hoặc Easy trong 30 ngày qua
          </p>
        </div>
      </div>

      {/* Total Reviews Logged */}
      <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 shadow-sm transition-all hover:border-[#d4d4d4] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 font-['Inter'] uppercase tracking-wider">
            Tổng lượt ôn tập
          </span>
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold font-['Nunito'] text-black">
            {totalReviews}
          </div>
          <p className="text-xs text-neutral-400 font-['Inter'] mt-1">
            Tổng số thẻ đã được lật và chấm điểm
          </p>
        </div>
      </div>

      {/* Streak Momentum */}
      <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 shadow-sm transition-all hover:border-[#d4d4d4] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 font-['Inter'] uppercase tracking-wider">
            Chuỗi ngày học
          </span>
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold font-['Nunito'] text-black flex items-baseline gap-2">
            <span>{currentStreak}</span>
            <span className="text-sm font-semibold text-neutral-400 font-['Inter']">
              ngày
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-['Inter'] mt-1">
            Kỷ lục cao nhất:{" "}
            <strong className="text-black font-['JetBrains_Mono']">
              {bestStreak}
            </strong>{" "}
            ngày
          </p>
        </div>
      </div>
    </div>
  );
};
