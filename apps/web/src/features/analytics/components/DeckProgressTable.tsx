import React from "react";
import type { DeckForecastDto } from "@wordstreak/shared-types";
import {
  Layers,
  CheckCircle2,
  TrendingUp,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

interface DeckProgressTableProps {
  decks: DeckForecastDto[];
  isLoading?: boolean;
}

export const DeckProgressTable: React.FC<DeckProgressTableProps> = ({
  decks,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 sm:p-8 animate-pulse">
        <div className="h-6 w-48 bg-neutral-200 rounded-full mb-6" />
        <div className="space-y-4">
          <div className="h-16 bg-neutral-100 rounded-2xl" />
          <div className="h-16 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="bg-white border border-[#e5e5e5] rounded-3xl p-8 text-center shadow-sm">
        <Layers className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
        <p className="text-sm text-neutral-500 font-['Inter']">
          Chưa có bộ từ nào để tính toán tiến độ.
        </p>
      </div>
    );
  }

  const formatCompletionDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:border-[#d4d4d4]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-['Nunito'] text-black tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-neutral-800" />
            Tiến độ & Dự báo hoàn thành Bộ từ
          </h2>
          <p className="text-sm text-neutral-500 font-['Inter'] mt-1">
            Ước tính thời gian đạt 100% Mastered dựa trên tốc độ ôn tập 7 ngày
            qua
          </p>
        </div>
      </div>

      {/* List / Table */}
      <div className="divide-y divide-neutral-100">
        {decks.map((deck) => {
          const masteryPercent =
            deck.totalCards > 0
              ? Math.round((deck.masteredCards / deck.totalCards) * 100)
              : 0;

          return (
            <div
              key={deck.deckId}
              className="py-4.5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Left Info */}
              <div className="space-y-1.5 min-w-[220px]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: deck.deckColor || "#6366F1" }}
                  />
                  <Link
                    to={`/decks/${deck.deckId}`}
                    className="font-bold text-base font-['Nunito'] text-black group-hover:text-purple-600 transition-colors flex items-center gap-1"
                  >
                    {deck.deckTitle}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
                <div className="text-xs text-neutral-400 font-['JetBrains_Mono']">
                  {deck.masteredCards} / {deck.totalCards} từ đã thành thạo (
                  {masteryPercent}%)
                </div>
              </div>

              {/* Middle: Progress Bar */}
              <div className="flex-1 max-w-xs space-y-1">
                <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/60">
                  <div
                    style={{ width: `${masteryPercent}%` }}
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-neutral-400 font-['Inter']">
                  <span>
                    Còn lại: <strong>{deck.remainingCards}</strong> từ
                  </span>
                  <span>
                    Tốc độ: <strong>{deck.dailyVelocity}</strong> từ/ngày
                  </span>
                </div>
              </div>

              {/* Right: Forecast Badge */}
              <div className="flex items-center gap-2 self-start md:self-center">
                {deck.isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 font-['Inter']">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Đã hoàn thành 100% 🎉
                  </span>
                ) : deck.totalCards === 0 ? (
                  <span className="text-xs text-neutral-400 font-['Inter']">
                    Chưa có từ vựng
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-medium text-purple-900 font-['Inter']">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>
                      Dự kiến:{" "}
                      <strong>~{deck.estimatedDaysToComplete} ngày</strong>
                      {deck.projectedCompletionDate && (
                        <span className="text-purple-700 font-['JetBrains_Mono'] ml-1">
                          ({formatCompletionDate(deck.projectedCompletionDate)})
                        </span>
                      )}
                    </span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
