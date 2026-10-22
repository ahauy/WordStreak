import React from "react";
import { ShieldAlert, Zap, ArrowRight } from "lucide-react";
import type { BacklogWarningDto } from "@wordstreak/shared-types";

export interface BacklogGuardBannerProps {
  backlogWarning?: BacklogWarningDto | null;
  onStartExpressSession?: () => void;
  className?: string;
}

export const BacklogGuardBanner: React.FC<BacklogGuardBannerProps> = ({
  backlogWarning,
  onStartExpressSession,
  className = "",
}) => {
  if (!backlogWarning?.isOverwhelmed) {
    return null;
  }

  const { dueCount, suggestedBatchSize, dailyGoal } = backlogWarning;

  return (
    <div
      data-testid="backlog-guard-banner"
      role="alert"
      className={`rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 text-amber-950 transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5 sm:mt-0">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-800 font-mono">
                Chế độ chống ngợp (Backlog Guard)
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-200/80 text-amber-900 font-mono">
                {dueCount} thẻ đến hạn
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed max-w-2xl">
              Số thẻ ôn tập dồn ứ đã vượt ngưỡng an toàn (&gt; 3 lần mục tiêu {dailyGoal} từ/ngày).
              Hệ thống đã <strong>tạm dừng nạp từ mới</strong> để bạn không bị quá tải.
              Hãy giải quyết nhẹ nhàng từng đợt <strong>{suggestedBatchSize} từ</strong> để lấy lại nhịp học.
            </p>
          </div>
        </div>

        {onStartExpressSession && (
          <button
            type="button"
            onClick={onStartExpressSession}
            data-testid="express-session-button"
            className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-full bg-amber-900 text-amber-50 text-xs font-semibold hover:bg-amber-950 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Ôn nhanh 5 phút</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
