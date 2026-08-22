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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["decks", "common"]);
  const theme = getColorTheme(deck.color);

  return (
    <div className="rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-xs mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Deck Icon & Metadata */}
        <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
            style={{
              backgroundColor: theme.bgLight,
              border: `1px solid ${theme.borderLight}`,
              color: theme.hex,
            }}
          >
            <DeckIcon iconName={deck.icon} className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e9d5ff] bg-[#f3e8ff] px-2.5 py-0.5 text-[#7e22ce]">
                <Layers className="w-3 h-3" />
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
                  {t("title", "Bộ từ vựng")}
                </span>
              </div>

              {deck.isPublic ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fafafa] text-[#737373] border border-[#e5e5e5]">
                  <Globe className="w-3 h-3" />
                  <span>{t("modal.public", "Công khai")}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fafafa] text-[#737373] border border-[#e5e5e5]">
                  <Lock className="w-3 h-3" />
                  <span>{t("modal.private", "Riêng tư")}</span>
                </span>
              )}
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold text-black tracking-tight leading-snug"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {deck.title}
            </h1>

            {deck.description && (
              <p className="text-xs sm:text-sm text-[#737373] max-w-2xl leading-relaxed">
                {deck.description}
              </p>
            )}

            {deck.tags && deck.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
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

        {/* Right Side: Structured 2-Tier Action Hub */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
          {/* Primary Study Actions (Top Tier) */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onStartReview}
              className="btn-primary h-11 px-5 text-xs font-semibold gap-2 shadow-xs cursor-pointer inline-flex items-center justify-center flex-1 sm:flex-none focus-visible:ring-2 focus-visible:ring-black rounded-full"
            >
              <Sparkles className="w-4 h-4 text-[#ffbd2e] fill-current" />
              <span>{t("detail.studyButton", "Ôn tập ngay")}</span>
            </button>

            <button
              type="button"
              onClick={onStartQuiz}
              className="h-11 px-5 text-xs font-semibold gap-2 shadow-xs cursor-pointer inline-flex items-center justify-center flex-1 sm:flex-none rounded-full bg-[#f3e8ff] text-[#7e22ce] hover:bg-[#e9d5ff] border border-[#d8b4fe] transition-all focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <Zap className="w-4 h-4 text-[#9333ea] fill-current" />
              <span>{t("detail.practiceButton", "Trắc nghiệm Quiz")}</span>
            </button>
          </div>

          {/* Secondary Management Actions (Bottom Tier) */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start lg:justify-end">
            <button
              type="button"
              onClick={onAddCard}
              className="btn-secondary h-9 px-3.5 text-xs font-medium gap-1.5 cursor-pointer inline-flex items-center rounded-full hover:border-black"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>{t("detail.addCard", "Thêm thẻ")}</span>
            </button>

            <button
              type="button"
              onClick={onImport}
              className="btn-secondary h-9 px-3.5 text-xs font-medium gap-1.5 cursor-pointer inline-flex items-center rounded-full hover:border-black"
              title={t("importDeck", "Nhập từ")}
            >
              <Upload className="w-3.5 h-3.5 text-[#525252]" />
              <span>{t("importDeck", "Nhập từ")}</span>
            </button>

            <button
              type="button"
              onClick={onExport}
              className="btn-secondary h-9 px-3.5 text-xs font-medium gap-1.5 cursor-pointer inline-flex items-center rounded-full hover:border-black"
              title={t("exportDeck", "Xuất từ")}
            >
              <Download className="w-3.5 h-3.5 text-[#525252]" />
              <span>{t("exportDeck", "Xuất từ")}</span>
            </button>

            <button
              type="button"
              onClick={onEditDeck}
              className="btn-secondary h-9 px-3.5 text-xs font-medium gap-1.5 cursor-pointer inline-flex items-center rounded-full hover:border-black"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#525252]" />
              <span>{t("modal.editTitle", "Sửa bộ từ")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#f0f0f0]">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fafafa] border border-[#e5e5e5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block mb-1 font-mono">
            {t("detail.totalCards", "Tổng số thẻ")}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-black font-mono">
            {stats.totalCards}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fafafa] border border-[#e5e5e5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e22ce] block mb-1 font-mono">
            {t("detail.newCards", "Thẻ mới (New)")}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-black font-mono">
            {stats.newCards}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fafafa] border border-[#e5e5e5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563eb] block mb-1 font-mono">
            {t("detail.learning", "Đang học (Learning)")}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-black font-mono">
            {stats.learningCards}
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fafafa] border border-[#e5e5e5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#16a34a] block mb-1 font-mono">
            {t("detail.mastered", "Thành thạo (Mastered)")}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-black font-mono">
            {stats.masteredCards}
          </span>
        </div>
      </div>
    </div>
  );
};
