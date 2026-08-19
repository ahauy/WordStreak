import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MoreVertical,
  Edit2,
  Archive,
  RotateCcw,
  Trash2,
  Flame,
  ArrowRight,
  Globe,
  Lock,
} from "lucide-react";
import type { DeckResponse } from "@wordstreak/shared-types";
import { getIconComponent, getColorTheme } from "../constants/deckThemes";

interface DeckCardProps {
  deck: DeckResponse;
  onEdit: (deck: DeckResponse) => void;
  onArchive: (deck: DeckResponse) => void;
  onRestore: (deck: DeckResponse) => void;
  onDelete: (deck: DeckResponse) => void;
  onSelect?: (deck: DeckResponse) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onSelect,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const IconComp = getIconComponent(deck.icon);
  const theme = getColorTheme(deck.color);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const stats = deck.stats || {
    totalCards: 0,
    newCards: 0,
    learningCards: 0,
    masteredCards: 0,
    dueCards: 0,
  };

  const total = stats.totalCards || 0;
  const masteredPct = total > 0 ? (stats.masteredCards / total) * 100 : 0;
  const learningPct = total > 0 ? (stats.learningCards / total) * 100 : 0;
  const newPct = total > 0 ? (stats.newCards / total) * 100 : 0;
  const hasDue = stats.dueCards > 0;

  return (
    // Lesson 1 (MEMORY.md): Stable outer anchor to prevent 60Hz hover flicker
    <div className="relative pt-2 -mt-2 pb-2 -mb-2 group">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 360, damping: 24 }}
        className="bg-white rounded-2xl border border-[#e5e5e5] hover:border-[#d4d4d4] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-200 flex flex-col h-full overflow-hidden"
      >
        {/* Cover / Header Accent */}
        {deck.coverImageUrl && !imageError ? (
          <div className="relative h-28 w-full overflow-hidden bg-[#fafafa]">
            <img
              src={deck.coverImageUrl}
              alt={deck.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-md bg-white/90 text-black border border-white/40">
                <IconComp className="w-4 h-4" style={{ color: theme.hex }} />
              </span>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {deck.isPublic ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-white backdrop-blur-md">
                  <Globe className="w-2.5 h-2.5" />
                  <span>Public</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-white backdrop-blur-md">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Private</span>
                </span>
              )}
            </div>
          </div>
        ) : (
          <div
            className="h-3 w-full transition-colors duration-200"
            style={{ backgroundColor: theme.hex }}
          />
        )}

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* Top row: Icon (if no cover) & Actions Menu */}
            {!deck.coverImageUrl || imageError ? (
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: theme.bgLight,
                      border: `1px solid ${theme.borderLight}`,
                    }}
                  >
                    <IconComp
                      className="w-5 h-5"
                      style={{ color: theme.hex }}
                    />
                  </div>
                  {deck.isPublic ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#fafafa] border border-[#e5e5e5] text-[#737373]">
                      <Globe className="w-3 h-3" />
                      <span>Công khai</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#fafafa] border border-[#e5e5e5] text-[#737373]">
                      <Lock className="w-3 h-3" />
                      <span>Riêng tư</span>
                    </span>
                  )}
                </div>

                {/* Options Dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#737373] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer"
                    aria-label="Tùy chọn bộ từ"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-9 w-44 bg-white rounded-xl shadow-xl border border-[#e5e5e5] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          onEdit(deck);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#171717] hover:bg-[#fafafa] flex items-center gap-2.5 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#737373]" />
                        <span>Chỉnh sửa thông tin</span>
                      </button>

                      {deck.isArchived ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(false);
                            onRestore(deck);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#171717] hover:bg-[#fafafa] flex items-center gap-2.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>Khôi phục bộ từ</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(false);
                            onArchive(deck);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#171717] hover:bg-[#fafafa] flex items-center gap-2.5 cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>Lưu trữ bộ từ</span>
                        </button>
                      )}

                      <div className="h-px bg-[#e5e5e5] my-1" />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          onDelete(deck);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#ff5f56] hover:bg-[#fff1f2] flex items-center gap-2.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#ff5f56]" />
                        <span>Xóa vĩnh viễn</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-end mb-1" ref={menuRef}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#737373] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer"
                    aria-label="Tùy chọn bộ từ"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-xl border border-[#e5e5e5] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          onEdit(deck);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#171717] hover:bg-[#fafafa] flex items-center gap-2.5 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#737373]" />
                        <span>Chỉnh sửa thông tin</span>
                      </button>

                      {deck.isArchived ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(false);
                            onRestore(deck);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#171717] hover:bg-[#fafafa] flex items-center gap-2.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>Khôi phục bộ từ</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(false);
                            onArchive(deck);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#171717] hover:bg-[#fafafa] flex items-center gap-2.5 cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>Lưu trữ bộ từ</span>
                        </button>
                      )}

                      <div className="h-px bg-[#e5e5e5] my-1" />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          onDelete(deck);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#ff5f56] hover:bg-[#fff1f2] flex items-center gap-2.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#ff5f56]" />
                        <span>Xóa vĩnh viễn</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Title & Description */}
            <h3
              className="text-base sm:text-lg font-bold text-black group-hover:text-[#9333ea] transition-colors leading-snug line-clamp-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {deck.title}
            </h3>

            {deck.description && (
              <p className="text-xs sm:text-sm text-[#737373] mt-1 line-clamp-2 leading-relaxed font-normal">
                {deck.description}
              </p>
            )}

            {/* Tags (if any) */}
            {deck.tags && deck.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {deck.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono text-[#525252] bg-[#fafafa] border border-[#e5e5e5]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom stats & progress section */}
          <div className="pt-3 border-t border-[#e5e5e5] space-y-3">
            {/* Quick Metrics */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-semibold text-black">
                  {total}
                </span>
                <span className="text-[#737373]">từ vựng</span>
              </div>

              {hasDue ? (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f3e8ff] border border-[#e9d5ff] text-[#7e22ce] text-[11px] font-semibold animate-pulse">
                  <Flame className="w-3 h-3 text-[#9333ea] fill-[#9333ea]" />
                  <span>{stats.dueCards} cần ôn</span>
                </div>
              ) : (
                <span className="text-[11px] text-[#10B981] font-medium flex items-center gap-1">
                  ✓ Đã ôn xong
                </span>
              )}
            </div>

            {/* Segmented Progress Bar */}
            {total > 0 ? (
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-[#f5f5f7] rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#10B981] h-full transition-all duration-500"
                    style={{ width: `${masteredPct}%` }}
                    title={`Thuần thục: ${stats.masteredCards}`}
                  />
                  <div
                    className="bg-[#6366F1] h-full transition-all duration-500"
                    style={{ width: `${learningPct}%` }}
                    title={`Đang học: ${stats.learningCards}`}
                  />
                  <div
                    className="bg-[#e5e5e5] h-full transition-all duration-500"
                    style={{ width: `${newPct}%` }}
                    title={`Mới: ${stats.newCards}`}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#a3a3a3] font-mono">
                  <span>Mới: {stats.newCards}</span>
                  <span>Đang học: {stats.learningCards}</span>
                  <span>Thuần thục: {stats.masteredCards}</span>
                </div>
              </div>
            ) : (
              <div className="h-1.5 w-full bg-[#f5f5f7] rounded-full" />
            )}

            {/* Action Buttons */}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelect && onSelect(deck)}
                className="flex-1 btn-primary h-9 text-xs font-semibold gap-1.5 justify-center cursor-pointer"
              >
                <span>{hasDue ? "Ôn tập ngay" : "Xem danh sách từ"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
