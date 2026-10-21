import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { DashboardNavbar } from "../../dashboard/components/DashboardNavbar";
import { libraryService } from "../services/libraryService";
import { ToeicCoverageProgressBar } from "../components/ToeicCoverageProgressBar";
import { SourceAttributionBadge } from "../components/SourceAttributionBadge";
import type { ToeicPathProgressResponse } from "@wordstreak/shared-types";

export const ToeicPathPage: React.FC = () => {
  const [data, setData] = useState<ToeicPathProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<string>("T1");

  useEffect(() => {
    let ignore = false;
    libraryService
      .getToeicPathProgress()
      .then((res) => {
        if (!ignore) {
          setData(res);
          setError(null);
          setIsLoading(false);
          // Set active level to first incomplete level if available
          const firstIncomplete = res.levels.find((l) => l.progressPercent < 100);
          if (firstIncomplete) {
            setActiveLevel(firstIncomplete.level);
          }
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu lộ trình TOEIC.",
          );
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const currentLevelData = data?.levels.find((l) => l.level === activeLevel);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#090909]">
      <DashboardNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/library"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Thư viện</span>
          </Link>

          <SourceAttributionBadge />
        </div>

        {/* Page Title Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-neutral-900 text-white rounded-full">
              Lộ trình TOEIC 1.200 từ
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              TSL 1.2 Standard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#090909] font-['Nunito',sans-serif]">
            Bản đồ Tiến trình Từ vựng TOEIC
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl leading-relaxed">
            Học tập trung 1.200 từ vựng có tần suất xuất hiện cao nhất trong đề thi TOEIC. Kết hợp cùng 2.809 từ NGSL
            để đạt độ phủ lên đến ~98.5% nội dung nghe hiểu và đọc hiểu.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
            <p className="text-xs text-neutral-500">Đang tải bản đồ lộ trình...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Lỗi tải dữ liệu</p>
              <p>{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-white border border-red-300 rounded-full font-medium hover:bg-red-50 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Main Content when loaded */}
        {!isLoading && data && (
          <div className="space-y-8">
            {/* Real-time Coverage Bar Hero */}
            <ToeicCoverageProgressBar
              coveragePercent={data.coveragePercent}
              ngslCoveragePercent={data.ngslCoveragePercent}
              tslCoveragePercent={data.tslCoveragePercent}
              maxEstimatedCoverage={data.maxEstimatedCoverage}
              totalWords={data.totalWords}
              learnedWords={data.masteredWords + data.knownSkippedWords}
            />

            {/* Path Meta Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">Tiến độ Bộ từ</p>
                  <p className="text-base font-bold text-neutral-900 font-['Nunito',sans-serif]">
                    {data.completedDecks} / {data.totalDecks} bộ
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">Dự kiến về đích</p>
                  <p className="text-base font-bold text-neutral-900 font-['Nunito',sans-serif]">
                    ~{data.estimatedDaysRemaining} ngày
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">Mục tiêu hằng ngày</p>
                  <p className="text-base font-bold text-neutral-900 font-['Nunito',sans-serif]">
                    {data.dailyGoal} từ / ngày
                  </p>
                </div>
              </div>
            </div>

            {/* Level Tabs Navigation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto">
                {data.levels.map((lvl) => {
                  const isActive = activeLevel === lvl.level;
                  return (
                    <button
                      key={lvl.level}
                      type="button"
                      onClick={() => setActiveLevel(lvl.level)}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                        isActive
                          ? "bg-neutral-900 text-white shadow-xs"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      <span>Cấp {lvl.level}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {lvl.progressPercent}%
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Current Level Header & Details */}
              {currentLevelData && (
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 font-['Nunito',sans-serif]">
                      {currentLevelData.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {currentLevelData.completedDecks} / {currentLevelData.totalDecks} bộ hoàn thành ·{" "}
                      {currentLevelData.learnedCards} / {currentLevelData.totalCards} từ vựng
                    </p>
                  </div>
                  <div className="w-full sm:w-48 bg-neutral-200 h-2 rounded-full overflow-hidden self-center sm:self-auto">
                    <div
                      className="bg-neutral-900 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentLevelData.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Decks Grid in Active Level */}
              {currentLevelData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {currentLevelData.decks.map((deck) => {
                    const learnedInDeck = deck.masteredCount + deck.knownSkippedCount;
                    return (
                      <Link
                        key={deck.deckId}
                        to={`/library/decks/${deck.slug}`}
                        className="group p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-400 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-semibold text-neutral-400">
                              #{deck.order}
                            </span>
                            {deck.isCompleted ? (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Đã xong
                              </span>
                            ) : learnedInDeck > 0 ? (
                              <span className="text-[10px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-full">
                                {learnedInDeck}/{deck.totalCards} từ
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-full">
                                Chưa học
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-neutral-900 group-hover:text-black transition-colors font-['Nunito',sans-serif]">
                            {deck.titleVi || deck.title}
                          </h4>
                          <p className="text-xs text-neutral-500 font-mono">
                            {deck.title}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                          <span>{deck.totalCards} từ vựng</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-neutral-800 group-hover:translate-x-0.5 transition-transform">
                            Vào học
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
