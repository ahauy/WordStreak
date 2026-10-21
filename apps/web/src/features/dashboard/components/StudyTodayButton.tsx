import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface StudyTodayButtonProps {
  totalCount?: number;
  dueCount?: number;
  newCount?: number;
  isCompleted?: boolean;
  className?: string;
  onClick?: () => void;
}

export const StudyTodayButton: React.FC<StudyTodayButtonProps> = ({
  totalCount = 0,
  dueCount = 0,
  isCompleted = false,
  className = "",
  onClick,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation(["dashboard", "common"]);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    // Navigate directly to unified review session with auto-mix mode
    navigate("/review", { state: { autoMix: true, todaySession: true } });
  };

  if (isCompleted || totalCount === 0) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#fafafa] border border-[#e5e5e5] text-[#525252] ${className}`}
        data-testid="study-today-completed"
      >
        <CheckCircle2 className="w-4 h-4 text-[#27c93f]" />
        <span>{t("studyTodayCompleted", "Mục tiêu hôm nay đã hoàn thành!")}</span>
      </div>
    );
  }

  const label =
    dueCount > 0
      ? t("studyTodayDue", "Ôn tập ngay · {{count}} thẻ đến hạn", {
          count: dueCount,
        })
      : t("studyTodayNew", "Học từ mới · {{count}} thẻ", {
          count: totalCount,
        });

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Stable outer anchor to prevent hover jitter */}
      <button
        type="button"
        onClick={handleClick}
        data-testid="study-today-button"
        className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#000000] text-white hover:bg-[#171717] transition-all shadow-sm hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
      >
        <Sparkles className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
        <span>{label}</span>
        <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};
