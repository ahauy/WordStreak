import React from "react";
import { Layers, ArrowRight, Plus, Zap, CheckCircle2 } from "lucide-react";

interface DeckItem {
  id: string;
  title: string;
  description: string;
  totalCards: number;
  dueCards: number;
  retentionRate: number;
  tag: string;
}

interface DecksPreviewSectionProps {
  onStartPractice?: (deckId?: string) => void;
  onCreateDeck?: () => void;
}

export const DecksPreviewSection: React.FC<DecksPreviewSectionProps> = ({
  onStartPractice,
  onCreateDeck,
}) => {
  // Sample starter decks for language learners
  const sampleDecks: DeckItem[] = [
    {
      id: "oxford-3000",
      title: "Oxford 3000 Core Vocabulary",
      description:
        "3,000 từ vựng cốt lõi quan trọng nhất trong tiếng Anh giao tiếp và học thuật.",
      totalCards: 120,
      dueCards: 8,
      retentionRate: 94,
      tag: "Core English",
    },
    {
      id: "ielts-academic",
      title: "IELTS Academic Band 7.5+",
      description:
        "Bộ từ vựng nâng cao chuyên sâu cho kỹ năng Reading & Writing Task 2.",
      totalCards: 85,
      dueCards: 0,
      retentionRate: 98,
      tag: "IELTS",
    },
    {
      id: "conversational-idioms",
      title: "Everyday Slang & Idioms",
      description:
        "Thành ngữ và cụm từ tự nhiên người bản xứ sử dụng trong đời sống hàng ngày.",
      totalCards: 64,
      dueCards: 12,
      retentionRate: 88,
      tag: "Idioms",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 mb-2">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
              Bộ thẻ từ vựng
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Bộ từ vựng ôn tập hôm nay
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8] mt-0.5">
            Các bộ từ được lập lịch Spaced Repetition tối ưu cho bạn.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateDeck}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-xs font-semibold text-white transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#f5a623]" />
          <span>Tạo bộ thẻ mới</span>
        </button>
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sampleDecks.map((deck) => {
          const hasDue = deck.dueCards > 0;

          return (
            <div
              key={deck.id}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1526]/80 p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#f5a623]/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#f5a623]/10 flex flex-col justify-between group"
            >
              <div>
                {/* Top Deck Tag & Due Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/[0.05] text-[#cbd5e1] border border-white/10">
                    {deck.tag}
                  </span>
                  {hasDue ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f5a623] bg-[#f5a623]/15 px-2.5 py-0.5 rounded-full border border-[#f5a623]/30 animate-pulse">
                      <Zap className="w-3 h-3 fill-current" /> {deck.dueCards}{" "}
                      cần ôn
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#30d158] bg-[#30d158]/10 px-2.5 py-0.5 rounded-full border border-[#30d158]/20">
                      <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành
                    </span>
                  )}
                </div>

                {/* Deck Title & Description */}
                <h3
                  className="text-lg font-bold text-white tracking-tight group-hover:text-[#f5a623] transition-colors line-clamp-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {deck.title}
                </h3>
                <p className="text-xs text-[#94a3b8] mt-1.5 line-clamp-2 leading-relaxed">
                  {deck.description}
                </p>
              </div>

              {/* Deck Stats & Action */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="text-xs text-[#94a3b8]">
                  <span className="text-white font-bold">
                    {deck.totalCards}
                  </span>{" "}
                  thẻ ·{" "}
                  <span className="text-[#30d158] font-bold">
                    {deck.retentionRate}%
                  </span>{" "}
                  nhớ
                </div>

                <button
                  type="button"
                  onClick={() => onStartPractice?.(deck.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#f5a623] hover:text-[#ffb940] transition-colors cursor-pointer group-hover:translate-x-0.5"
                >
                  <span>{hasDue ? "Ôn tập ngay" : "Luyện tập"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
