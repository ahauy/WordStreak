import React from "react";
import {
  Sparkles,
  Target,
  Zap,
  Trophy,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useXpHistory } from "../hooks/useXpHistory";
import { useXpSummary } from "../hooks/useXpSummary";
import { TierBadgeIcon } from "./TierBadgeIcon";
import { XpProgressBar } from "./XpProgressBar";
import {
  XpActionType,
  type UserActivityLogItemDto,
} from "@wordstreak/shared-types";

export interface XpHistoryDrawerProps {
  className?: string;
}

const FILTER_TABS: { label: string; type?: XpActionType }[] = [
  { label: "Tất cả" },
  { label: "Ôn tập thẻ", type: XpActionType.CARD_REVIEW },
  { label: "Mục tiêu ngày", type: XpActionType.DAILY_GOAL_COMPLETED },
  { label: "Chuỗi Streak", type: XpActionType.STREAK_7_DAYS },
  { label: "Luyện tập", type: XpActionType.PRACTICE_QUIZ },
];

function getActivityMeta(type: XpActionType | string): {
  icon: React.ReactNode;
  title: string;
  badgeBg: string;
  badgeText: string;
} {
  switch (type) {
    case XpActionType.CARD_REVIEW:
      return {
        icon: <BookOpen className="w-4 h-4 text-amber-500" />,
        title: "Ôn tập thẻ từ vựng",
        badgeBg: "bg-amber-50 border-amber-200",
        badgeText: "text-amber-700",
      };
    case XpActionType.DAILY_GOAL_COMPLETED:
      return {
        icon: <Target className="w-4 h-4 text-purple-600" />,
        title: "Hoàn thành mục tiêu ngày",
        badgeBg: "bg-purple-50 border-purple-200",
        badgeText: "text-purple-700",
      };
    case XpActionType.STREAK_7_DAYS:
      return {
        icon: <Zap className="w-4 h-4 text-amber-500" />,
        title: "Đạt mốc 7 ngày Streak",
        badgeBg: "bg-amber-50 border-amber-200",
        badgeText: "text-amber-700",
      };
    case XpActionType.STREAK_30_DAYS:
      return {
        icon: <Trophy className="w-4 h-4 text-purple-600" />,
        title: "Đạt mốc 30 ngày Streak",
        badgeBg: "bg-purple-50 border-purple-200",
        badgeText: "text-purple-700",
      };
    case XpActionType.PRACTICE_QUIZ:
      return {
        icon: <Sparkles className="w-4 h-4 text-cyan-600" />,
        title: "Bài tập thực hành / Quiz",
        badgeBg: "bg-cyan-50 border-cyan-200",
        badgeText: "text-cyan-700",
      };
    case XpActionType.HISTORICAL_BACKFILL:
      return {
        icon: <Clock className="w-4 h-4 text-slate-500" />,
        title: "Khôi phục dữ liệu lịch sử",
        badgeBg: "bg-slate-50 border-slate-200",
        badgeText: "text-slate-700",
      };
    default:
      return {
        icon: <Sparkles className="w-4 h-4 text-purple-500" />,
        title: "Điểm thưởng kinh nghiệm",
        badgeBg: "bg-purple-50 border-purple-200",
        badgeText: "text-purple-700",
      };
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export const XpHistoryDrawer: React.FC<XpHistoryDrawerProps> = ({
  className = "",
}) => {
  const {
    level,
    tier,
    totalXp,
    currentLevelXp,
    nextLevelRequiredXp,
    progressPercent,
    todayXp,
    tierMetadata,
  } = useXpSummary();

  const {
    logs,
    meta,
    page,
    activityType,
    isLoading,
    error,
    setActivityType,
    nextPage,
    prevPage,
    refetch,
  } = useXpHistory({ initialLimit: 10 });

  return (
    <div
      className={`space-y-5 text-black ${className}`}
      data-testid="xp-history-drawer"
    >
      {/* 1. Gamification Summary Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#fafafa] to-[#f5f5f5] border border-[#e5e5e5] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TierBadgeIcon tier={tier} size="lg" animateGlow />
            <div>
              <div className="flex items-center gap-1.5">
                <h3
                  className="text-base font-bold text-black"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Hạng {tierMetadata?.nameVi || "Đồng"}
                </h3>
                <span className="text-xs text-[#737373] uppercase font-mono">
                  ({tierMetadata?.nameEn || "Bronze"})
                </span>
              </div>
              <p className="text-xs text-[#7e22ce] font-semibold">
                Cấp độ {level} • {totalXp.toLocaleString()} XP tích lũy
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#737373] block font-medium">
              XP Hôm nay
            </span>
            <span className="text-sm font-extrabold text-[#16a34a] font-mono">
              +{todayXp} XP
            </span>
          </div>
        </div>

        {/* Level progress bar */}
        <div className="space-y-1 pt-1">
          <XpProgressBar
            progressPercent={progressPercent}
            tier={tier}
            height={6}
            showLabel={true}
            currentXp={currentLevelXp}
            requiredXp={nextLevelRequiredXp}
          />
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => {
          const isSelected = activityType === tab.type;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActivityType(tab.type)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-black text-white shadow-2xs"
                  : "bg-[#fafafa] text-[#737373] border border-[#e5e5e5] hover:text-black hover:border-[#d4d4d4]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Activity Logs List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#737373] gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-black" />
            <span className="text-xs">Đang tải lịch sử điểm XP...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-[#fff5f5] border border-[#ff5f56]/30 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-[#dc2626] mx-auto" />
            <p className="text-xs text-[#dc2626]">{error}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-3 py-1 rounded-full bg-black text-white text-xs font-medium cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] text-center space-y-2 text-[#737373]">
            <Clock className="w-8 h-8 mx-auto text-[#a3a3a3]" />
            <p className="text-sm font-semibold text-black">
              Chưa có hoạt động nào
            </p>
            <p className="text-xs max-w-xs mx-auto">
              Hãy hoàn thành các bài học và duy trì chuỗi Streak để nhận điểm XP
              thưởng!
            </p>
          </div>
        ) : (
          <div className="space-y-2" data-testid="xp-activity-list">
            {logs.map((log: UserActivityLogItemDto) => {
              const meta = getActivityMeta(log.activityType);
              return (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-white border border-[#e5e5e5] hover:border-[#d4d4d4] transition-all flex items-center justify-between gap-3 shadow-2xs"
                  data-testid="xp-activity-item"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${meta.badgeBg}`}
                    >
                      {meta.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-black">
                        {meta.title}
                      </p>
                      <span className="text-[10px] text-[#737373] font-mono">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] text-xs font-bold font-mono">
                      +{log.xpEarned} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-[#737373] border-t border-[#f0f0f0]">
          <span>
            Trang <strong>{page}</strong> / {meta.totalPages} ({meta.total} hoạt
            động)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevPage}
              disabled={page <= 1 || isLoading}
              className="p-1.5 rounded-full border border-[#e5e5e5] bg-white hover:bg-[#fafafa] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-4 h-4 text-black" />
            </button>

            <button
              type="button"
              onClick={nextPage}
              disabled={page >= meta.totalPages || isLoading}
              className="p-1.5 rounded-full border border-[#e5e5e5] bg-white hover:bg-[#fafafa] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Trang sau"
            >
              <ChevronRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
