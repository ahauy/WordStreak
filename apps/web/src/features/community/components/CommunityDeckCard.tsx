import React from "react";
import type { CommunityDeckItem } from "@wordstreak/shared-types";
import { BookOpen, Download, Star, User, Eye } from "lucide-react";

interface CommunityDeckCardProps {
  deck: CommunityDeckItem;
  onPreview: (deck: CommunityDeckItem) => void;
  onClone: (deck: CommunityDeckItem) => void;
  onRate?: (deck: CommunityDeckItem) => void;
  isCloning?: boolean;
}

export const CommunityDeckCard: React.FC<CommunityDeckCardProps> = ({
  deck,
  onPreview,
  onClone,
  onRate,
  isCloning = false,
}) => {
  return (
    /* Stable Outer Anchor to eliminate 60Hz hover jitter when inner card elevates */
    <div className="group relative pt-1 -mt-1 pb-1 -mb-1 flex flex-col h-full">
      <div className="flex flex-col justify-between h-full rounded-2xl border border-[#e5e5e5] bg-white p-5 transition-all duration-200 ease-out hover:border-[#d4d4d4] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1">
        <div>
          {/* Top Header: Category Badge & Card Count */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-[#faf5ff] text-[#7e22ce] border border-[#f3e8ff]">
              {deck.category || "Chung"}
            </span>

            <div className="flex items-center gap-1 text-xs font-mono text-[#737373]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{deck.totalCards} thẻ</span>
            </div>
          </div>

          {/* Title & Description */}
          <h3
            onClick={() => onPreview(deck)}
            className="text-base font-bold text-black line-clamp-1 cursor-pointer hover:text-[#7e22ce] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
            title={deck.title}
          >
            {deck.title}
          </h3>

          <p className="mt-1.5 text-xs text-[#737373] line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {deck.description || "Chưa có mô tả cho bộ từ vựng này."}
          </p>

          {/* Tags */}
          {deck.tags && deck.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {deck.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#fafafa] text-[#525252] border border-[#e5e5e5]"
                >
                  #{tag}
                </span>
              ))}
              {deck.tags.length > 3 && (
                <span className="text-[11px] font-mono text-[#a3a3a3] self-center">
                  +{deck.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Metrics & Author */}
        <div className="mt-5 pt-4 border-t border-[#f5f5f5]">
          <div className="flex items-center justify-between text-xs mb-3.5">
            {/* Creator Profile */}
            <div className="flex items-center gap-1.5 overflow-hidden">
              {deck.author.avatarUrl ? (
                <img
                  src={deck.author.avatarUrl}
                  alt={deck.author.username}
                  className="w-5 h-5 rounded-full object-cover shrink-0 border border-[#e5e5e5]"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center shrink-0 text-[#737373]">
                  <User className="w-3 h-3" />
                </div>
              )}
              <span className="truncate font-medium text-xs text-black">
                {deck.author.username}
              </span>
            </div>

            {/* Social Proof: Rating & Clones */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                className="flex items-center gap-1 text-amber-500 font-medium cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
                onClick={() => onRate && onRate(deck)}
                title={`${deck.averageRating} sao (${deck.totalRatings} lượt đánh giá)`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-mono text-xs font-bold text-black">
                  {deck.averageRating > 0 ? deck.averageRating.toFixed(1) : "—"}
                </span>
                <span className="text-[#a3a3a3] text-[11px] font-mono">
                  ({deck.totalRatings})
                </span>
              </button>

              <div
                className="flex items-center gap-1 text-[#737373]"
                title={`${deck.cloneCount} lượt sao chép`}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="font-mono text-xs">{deck.cloneCount}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPreview(deck)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-black bg-white hover:bg-[#fafafa] border border-[#e5e5e5] hover:border-[#d4d4d4] rounded-full transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước</span>
            </button>

            {deck.isOwner ? (
              <button
                type="button"
                disabled
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#a3a3a3] bg-[#fafafa] rounded-full border border-[#e5e5e5] cursor-not-allowed"
              >
                <span>Bộ từ của bạn</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isCloning}
                onClick={() => onClone(deck)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-black hover:bg-[#171717] rounded-full shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isCloning ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isCloning ? "Đang chép..." : "Sao chép"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
