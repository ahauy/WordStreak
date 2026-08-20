import React from "react";
import { CheckCircle2, ArrowRight, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

interface ReviewEmptyStateProps {
  deckTitle?: string;
  onRefresh?: () => void;
}

export const ReviewEmptyState: React.FC<ReviewEmptyStateProps> = ({
  deckTitle,
  onRefresh,
}) => {
  return (
    <div className="w-full max-w-md mx-auto my-12 p-8 text-center rounded-2xl border border-[#e5e5e5] bg-[#ffffff] shadow-sm">
      <div className="w-12 h-12 rounded-full bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-6 h-6 text-[#27c93f]" />
      </div>

      <h3 className="text-xl font-semibold text-[#000000] font-display mb-2">
        All caught up! 🎉
      </h3>

      <p className="text-sm text-[#737373] mb-6 leading-relaxed">
        {deckTitle
          ? `You have no cards due for review in "${deckTitle}". Great job staying consistent!`
          : "You have reviewed all due cards for today across your decks. Come back tomorrow or practice with custom decks!"}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#fafafa] border border-[#e5e5e5] text-[#525252] font-medium text-xs hover:bg-[#f5f5f5] hover:text-[#000000] transition-all inline-flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Check for Due Cards</span>
          </button>
        )}
        <Link
          to="/decks"
          className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#000000] text-[#ffffff] font-medium text-xs hover:bg-[#090909] transition-all inline-flex items-center justify-center gap-1.5"
        >
          <span>Explore Decks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/dashboard"
          className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#fafafa] border border-[#e5e5e5] text-[#525252] font-medium text-xs hover:bg-[#f5f5f5] hover:text-[#000000] transition-all inline-flex items-center justify-center"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
};
