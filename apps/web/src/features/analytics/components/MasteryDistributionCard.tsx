import React from "react";
import type { MasterySummaryDto } from "@wordstreak/shared-types";
import { Award, BookOpen, Sparkles, Layers } from "lucide-react";

interface MasteryDistributionCardProps {
  data: MasterySummaryDto | null;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
}

export const MasteryDistributionCard: React.FC<
  MasteryDistributionCardProps
> = ({
  data,
  isLoading = false,
  title = "Phân bổ mức độ thành thạo từ vựng",
  subtitle = "Phân loại thẻ theo khoảng thời gian nhắc lại SuperMemo-2",
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 sm:p-8 animate-pulse">
        <div className="h-6 w-48 bg-neutral-200 rounded-full mb-4" />
        <div className="h-4 w-full bg-neutral-100 rounded-full mb-6" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-neutral-100 rounded-2xl" />
          <div className="h-20 bg-neutral-100 rounded-2xl" />
          <div className="h-20 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const total = data?.totalCards || 0;
  const mastered = data?.masteredCount || 0;
  const learning = data?.learningCount || 0;
  const newCards = data?.newCount || 0;

  const masteredPct = data?.masteredPercentage || 0;
  const learningPct = data?.learningPercentage || 0;
  const newPct = data?.newPercentage || 0;

  if (total === 0) {
    return (
      <div className="bg-white border border-[#e5e5e5] rounded-3xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto mb-3 text-purple-600">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold font-['Nunito'] text-black mb-1">
          Chưa có thẻ từ vựng nào
        </h3>
        <p className="text-sm text-neutral-500 font-['Inter'] max-w-sm mx-auto">
          Tạo bộ từ đầu tiên và bắt đầu phiên ôn tập để kích hoạt hệ thống phân
          tích bộ nhớ.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:border-[#d4d4d4]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-['Nunito'] text-black tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-neutral-800" />
            {title}
          </h2>
          <p className="text-sm text-neutral-500 font-['Inter'] mt-1">
            {subtitle}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold font-['Nunito'] text-black">
            {total}
          </div>
          <div className="text-xs text-neutral-400 font-['JetBrains_Mono']">
            tổng số từ
          </div>
        </div>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="w-full h-4 bg-neutral-100 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-neutral-200/80 mb-6">
        {mastered > 0 && (
          <div
            style={{ width: `${masteredPct}%` }}
            className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
            title={`Thành thạo: ${mastered} từ (${masteredPct}%)`}
          />
        )}
        {learning > 0 && (
          <div
            style={{ width: `${learningPct}%` }}
            className={`h-full bg-indigo-500 transition-all duration-500 ${
              mastered === 0 ? "rounded-l-full" : ""
            } ${newCards === 0 ? "rounded-r-full" : ""}`}
            title={`Đang học: ${learning} từ (${learningPct}%)`}
          />
        )}
        {newCards > 0 && (
          <div
            style={{ width: `${newPct}%` }}
            className="h-full bg-slate-400 rounded-r-full transition-all duration-500"
            title={`Từ mới: ${newCards} từ (${newPct}%)`}
          />
        )}
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mastered */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800 font-['Inter'] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Thành thạo
            </span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-['Nunito'] text-emerald-950">
              {mastered}
            </span>
            <span className="text-xs font-bold text-emerald-700 font-['JetBrains_Mono']">
              {masteredPct}%
            </span>
          </div>
          <p className="text-[11px] text-emerald-700/80 font-['Inter'] mt-1">
            Interval &ge; 21 ngày (Trí nhớ dài hạn)
          </p>
        </div>

        {/* Learning */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-800 font-['Inter'] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              Đang học
            </span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-['Nunito'] text-indigo-950">
              {learning}
            </span>
            <span className="text-xs font-bold text-indigo-700 font-['JetBrains_Mono']">
              {learningPct}%
            </span>
          </div>
          <p className="text-[11px] text-indigo-700/80 font-['Inter'] mt-1">
            Interval 1–20 ngày (Đang lặp lại ngắt quãng)
          </p>
        </div>

        {/* New */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 font-['Inter'] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
              Từ mới
            </span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-['Nunito'] text-slate-900">
              {newCards}
            </span>
            <span className="text-xs font-bold text-slate-600 font-['JetBrains_Mono']">
              {newPct}%
            </span>
          </div>
          <p className="text-[11px] text-slate-600/80 font-['Inter'] mt-1">
            Chưa qua phiên ôn tập nào
          </p>
        </div>
      </div>
    </div>
  );
};
