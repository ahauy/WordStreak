import React from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReviewProgressBarProps {
  completedCount: number;
  totalCount: number;
  deckTitle?: string;
  onExit?: () => void;
}

export const ReviewProgressBar: React.FC<ReviewProgressBarProps> = ({
  completedCount,
  totalCount,
  deckTitle,
  onExit,
}) => {
  const navigate = useNavigate();
  const progressPercentage =
    totalCount > 0
      ? Math.min(100, Math.round((completedCount / totalCount) * 100))
      : 0;

  const handleClose = () => {
    if (onExit) {
      onExit();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-3 text-sm">
        {/* Back / Exit Button */}
        <button
          type="button"
          onClick={handleClose}
          className="flex items-center gap-1 text-[#737373] hover:text-[#000000] transition-colors text-xs font-medium"
          title="Exit review (Esc)"
        >
          <X className="w-4 h-4" />
          <span>Exit</span>
        </button>

        {/* Center Title */}
        <span className="font-medium text-[#000000] truncate max-w-[200px] sm:max-w-[300px]">
          {deckTitle || "Daily Review"}
        </span>

        {/* Counter */}
        <span className="text-xs font-mono text-[#737373]">
          {completedCount} / {totalCount}
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-1.5 bg-[#f5f5f5] rounded-full overflow-hidden border border-[#e5e5e5]">
        <div
          className="h-full bg-[#000000] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};
