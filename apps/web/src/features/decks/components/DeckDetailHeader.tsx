import React from "react";
import {
  Plus,
  Sparkles,
  Globe,
  Lock,
  Edit2,
  Layers,
  Zap,
  Upload,
  Download,
} from "lucide-react";
import { DeckIcon, getColorTheme } from "../constants/deckThemes";
import type { DeckResponse } from "@wordstreak/shared-types";

interface DeckDetailHeaderProps {
  deck: DeckResponse;
  stats: {
    totalCards: number;
    newCards: number;
    learningCards: number;
    masteredCards: number;
    dueCards: number;
  };
  onStartReview: () => void;
  onStartQuiz: () => void;
  onAddCard: () => void;
  onImport: () => void;
  onExport: () => void;
  onEditDeck: () => void;
}

export const DeckDetailHeader: React.FC<DeckDetailHeaderProps> = ({
  deck,
  stats,
  onStartReview,
  onStartQuiz,
  onAddCard,
  onImport,
  onExport,
  onEditDeck,
}) => {
  const theme = getColorTheme(deck.color);

  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-xs mb-8">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: theme.bgLight,
              border: `1px solid ${theme.borderLight}`,
              color: theme.hex,
            }}
          >
            <DeckIcon iconName={deck.icon} className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e9d5ff] bg-[#f3e8ff] px-2.5 py-0.5 text-[#7e22ce]">
                <Layers className="w-3 h-3" />
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  Bộ từ vựng
                </span>
              </div>

              {deck.isPublic ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fafafa] text-[#737373] border border-[#e5e5e5]">
                  <Globe className="w-3 h-3" />
                  <span>Công khai</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fafafa] text-[#737373] border border-[#e5e5e5]">
                  <Lock className="w-3 h-3" />
                  <span>Riêng tư</span>
                </span>
              )}
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold text-black tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {deck.title}
            </h1>

            {deck.description && (
              <p className="text-xs sm:text-sm text-[#737373] mt-1 max-w-2xl leading-relaxed">
                {deck.description}
              </p>
            )}

            {deck.tags && deck.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {deck.tags.map((tag, idx) => (
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
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 flex-shrink-0 self-start">
          <button
            type="button"
            onClick={onStartReview}
            className="h-10 px-4 text-xs font-semibold gap-2 shadow-xs cursor-pointer inline-flex items-center rounded-full bg-[#000000] text-[#ffffff] hover:bg-[#090909] transition-all whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-[#ffbd2e]" />
            <span>Ôn tập ngay</span>
          </button>

          <button
            type="button"
            onClick={onStartQuiz}
            className="h-10 px-4 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer inline-flex items-center rounded-full bg-[#f3e8ff] text-[#7e22ce] hover:bg-[#e9d5ff] border border-[#d8b4fe] transition-all whitespace-nowrap"
          >
            <Zap className="w-4 h-4 text-[#9333ea]" />
            <span>Trắc nghiệm Quiz</span>
          </button>

          <button
            type="button"
            onClick={onAddCard}
            className="btn-primary h-10 px-4 text-xs font-semibold gap-2 shadow-xs cursor-pointer inline-flex items-center whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm thẻ mới</span>
          </button>

          <button
            type="button"
            onClick={onImport}
            className="btn-secondary h-10 px-3.5 text-xs font-semibold gap-1.5 cursor-pointer inline-flex items-center whitespace-nowrap"
            title="Nhập từ vựng từ CSV, TSV, Anki"
          >
            <Upload className="w-3.5 h-3.5 text-[#525252]" />
            <span>Nhập từ</span>
          </button>

          <button
            type="button"
            onClick={onExport}
            className="btn-secondary h-10 px-3.5 text-xs font-semibold gap-1.5 cursor-pointer inline-flex items-center whitespace-nowrap"
            title="Xuất bộ từ ra CSV hoặc Anki"
          >
            <Download className="w-3.5 h-3.5 text-[#525252]" />
            <span>Xuất từ</span>
          </button>

          <button
            type="button"
            onClick={onEditDeck}
            className="btn-secondary h-10 px-4 text-xs font-semibold gap-1.5 cursor-pointer inline-flex items-center whitespace-nowrap"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#525252]" />
            <span>Sửa bộ từ</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#e5e5e5]">
        <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block mb-1">
            Tổng số thẻ
          </span>
          <span className="text-xl sm:text-2xl font-bold text-black font-mono">
            {stats.totalCards}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e22ce] block mb-1">
            Thẻ mới (New)
          </span>
          <span className="text-xl sm:text-2xl font-bold text-black font-mono">
            {stats.newCards}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563eb] block mb-1">
            Đang học (Learning)
          </span>
          <span className="text-xl sm:text-2xl font-bold text-black font-mono">
            {stats.learningCards}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#16a34a] block mb-1">
            Thành thạo (Mastered)
          </span>
          <span className="text-xl sm:text-2xl font-bold text-black font-mono">
            {stats.masteredCards}
          </span>
        </div>
      </div>
    </div>
  );
};
