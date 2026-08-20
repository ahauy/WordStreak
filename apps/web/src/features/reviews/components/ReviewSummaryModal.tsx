import React from "react";
import { Trophy, RotateCcw, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { SessionStats } from "../hooks/useReviewSession";

interface ReviewSummaryModalProps {
  stats: SessionStats;
  onRestart?: () => void;
}

export const ReviewSummaryModal: React.FC<ReviewSummaryModalProps> = ({
  stats,
  onRestart,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="w-full max-w-lg mx-auto my-8 p-8 rounded-2xl border border-[#e5e5e5] bg-[#ffffff] shadow-sm text-center">
      {/* Celebration Icon / Mascot Badge */}
      <div className="w-16 h-16 rounded-full bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center mx-auto mb-4 relative">
        <Trophy className="w-8 h-8 text-[#ffbd2e]" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27c93f] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#27c93f]"></span>
        </span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000] font-display mb-2">
        Session Complete! 🎉
      </h2>

      <p className="text-sm text-[#737373] mb-8">
        You've reviewed your due cards and kept your memory sharp with
        SuperMemo-2.
      </p>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {/* Total Reviewed */}
        <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] flex flex-col items-center">
          <span className="text-2xl font-bold text-[#000000] font-display">
            {stats.totalReviewed}
          </span>
          <span className="text-xs text-[#737373] mt-1">Cards Reviewed</span>
        </div>

        {/* Accuracy */}
        <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] flex flex-col items-center">
          <span className="text-2xl font-bold text-[#27c93f] font-display">
            {stats.accuracyPercentage}%
          </span>
          <span className="text-xs text-[#737373] mt-1">Retention Rate</span>
        </div>

        {/* Time Spent */}
        <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] flex flex-col items-center">
          <span className="text-2xl font-bold text-[#000000] font-display">
            {formatTime(stats.durationSeconds)}
          </span>
          <span className="text-xs text-[#737373] mt-1">Time Spent</span>
        </div>
      </div>

      {/* Accuracy Detail */}
      <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] text-left mb-8">
        <div className="flex justify-between text-xs font-medium text-[#525252] mb-2">
          <span>
            Remembered (Good / Easy):{" "}
            <strong className="text-[#27c93f]">{stats.goodEasyCount}</strong>
          </span>
          <span>
            Forgot (Again / Hard):{" "}
            <strong className="text-[#ff5f56]">{stats.againHardCount}</strong>
          </span>
        </div>
        <div className="w-full h-2 bg-[#e5e5e5] rounded-full overflow-hidden flex">
          <div
            className="h-full bg-[#27c93f]"
            style={{
              width: `${stats.totalReviewed > 0 ? (stats.goodEasyCount / stats.totalReviewed) * 100 : 100}%`,
            }}
          />
          <div
            className="h-full bg-[#ff5f56]"
            style={{
              width: `${stats.totalReviewed > 0 ? (stats.againHardCount / stats.totalReviewed) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#fafafa] border border-[#e5e5e5] text-[#525252] font-medium text-xs hover:bg-[#f5f5f5] hover:text-[#000000] transition-all inline-flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Review Again</span>
          </button>
        )}
        <Link
          to="/dashboard"
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#000000] text-[#ffffff] font-medium text-xs hover:bg-[#090909] transition-all inline-flex items-center justify-center gap-2"
        >
          <span>Go to Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/decks"
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#fafafa] border border-[#e5e5e5] text-[#525252] font-medium text-xs hover:bg-[#f5f5f5] hover:text-[#000000] transition-all inline-flex items-center justify-center"
        >
          All Decks
        </Link>
      </div>
    </div>
  );
};
