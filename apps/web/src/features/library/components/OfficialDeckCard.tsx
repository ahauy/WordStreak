import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle, Clock, ArrowRight, Plus } from "lucide-react";
import type { OfficialDeckDto } from "@wordstreak/shared-types";
import { SourceAttributionBadge } from "./SourceAttributionBadge";

interface OfficialDeckCardProps {
  deck: OfficialDeckDto;
  onEnroll: (deckId: string) => Promise<void>;
  isEnrolling?: boolean;
}

export const OfficialDeckCard: React.FC<OfficialDeckCardProps> = ({
  deck,
  onEnroll,
  isEnrolling = false,
}) => {
  const mastered = deck.masteredCount ?? 0;
  const progressPct =
    deck.cardCount > 0 ? Math.round((mastered / deck.cardCount) * 100) : 0;

  const handleEnrollClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onEnroll(deck.id);
  };

  return (
    <div className="relative group block rounded-2xl bg-white border border-[#e5e5e5] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#d4d4d4] flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fafafa] border border-[#e5e5e5] text-[#090909]">
              {deck.pathCode}
            </span>
            {deck.level && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#fafafa] border border-[#e5e5e5] text-[#525252]">
                {deck.level}
              </span>
            )}
          </div>
          <SourceAttributionBadge showLink={true} href="/sources" />
        </div>

        {/* Title & Meaning */}
        <Link to={`/library/decks/${deck.slug}`} className="block group-hover:text-black">
          <h3 className="font-nunito font-bold text-lg text-[#090909] leading-snug">
            {deck.title}
          </h3>
          <p className="text-sm text-[#737373] font-medium mt-0.5">
            {deck.titleVi}
          </p>
        </Link>

        {/* Description */}
        {deck.description && (
          <p className="text-xs text-[#525252] mt-2 line-clamp-2 leading-relaxed">
            {deck.description}
          </p>
        )}

        {/* Meta Stats */}
        <div className="flex items-center gap-3 mt-4 text-xs text-[#737373]">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#525252]" />
            {deck.cardCount} từ vựng
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#525252]" />
            ~10 phút
          </span>
        </div>

        {/* Progress Bar if Enrolled */}
        {deck.isEnrolled && (
          <div className="mt-4 pt-3 border-t border-[#f5f5f5]">
            <div className="flex justify-between items-center text-xs text-[#525252] mb-1.5">
              <span>Đã thuộc</span>
              <span className="font-mono font-medium">
                {mastered}/{deck.cardCount} ({progressPct}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#000000] rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-[#f0f0f0]">
        <Link
          to={`/library/decks/${deck.slug}`}
          className="text-xs font-semibold text-[#525252] hover:text-[#000000] transition-colors inline-flex items-center gap-1"
        >
          Xem từ vựng
          <ArrowRight className="w-3 h-3" />
        </Link>

        {deck.isEnrolled ? (
          <Link
            to={`/library/decks/${deck.slug}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#000000] text-white hover:bg-[#171717] transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Học ngay
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleEnrollClick}
            disabled={isEnrolling}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#000000] text-white hover:bg-[#171717] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {isEnrolling ? "Đang thêm..." : "Thêm vào thư viện"}
          </button>
        )}
      </div>
    </div>
  );
};
