import React from "react";
import { Link } from "react-router-dom";
import { Layers, ArrowRight, Plus, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e9d5ff] bg-[#f3e8ff] px-3 py-1 mb-2 text-[#7e22ce]">
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Bộ thẻ từ vựng
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl font-bold text-black tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Bộ từ vựng ôn tập hôm nay
          </h2>
          <p className="text-xs sm:text-sm text-[#737373] mt-0.5">
            Các bộ từ được lập lịch Spaced Repetition tối ưu cho bạn.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/decks"
            className="btn-secondary h-10 px-4 text-xs font-semibold gap-1.5 cursor-pointer inline-flex items-center"
          >
            <Layers className="w-3.5 h-3.5 text-[#525252]" />
            <span>Quản lý tất cả bộ từ</span>
          </Link>

          <button
            type="button"
            onClick={onCreateDeck}
            className="btn-primary h-10 px-4 text-xs font-semibold gap-1.5 cursor-pointer inline-flex items-center"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Tạo bộ thẻ mới</span>
          </button>
        </div>
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {sampleDecks.map((deck) => {
          const hasDue = deck.dueCards > 0;

          return (
            <motion.div
              key={deck.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-6 shadow-xs hover:border-black flex flex-col justify-between group transition-colors"
            >
              <div>
                {/* Top Deck Tag & Due Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#fafafa] text-[#525252] border border-[#e5e5e5]">
                    {deck.tag}
                  </span>
                  {hasDue ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7e22ce] bg-[#f3e8ff] px-2.5 py-0.5 rounded-full border border-[#e9d5ff]">
                      <Zap className="w-3 h-3 fill-current" /> {deck.dueCards}{" "}
                      cần ôn
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16a34a] bg-[#f0fdf4] px-2.5 py-0.5 rounded-full border border-[#bbf7d0]">
                      <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành
                    </span>
                  )}
                </div>

                {/* Deck Title & Description */}
                <h3
                  className="text-base sm:text-lg font-bold text-black tracking-tight group-hover:text-[#7e22ce] transition-colors line-clamp-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {deck.title}
                </h3>
                <p className="text-xs text-[#737373] mt-1.5 line-clamp-2 leading-relaxed">
                  {deck.description}
                </p>
              </div>

              {/* Deck Stats & Action */}
              <div className="mt-6 pt-4 border-t border-[#f0f0f0] flex items-center justify-between">
                <div className="text-xs text-[#737373]">
                  <span className="text-black font-semibold">
                    {deck.totalCards}
                  </span>{" "}
                  thẻ ·{" "}
                  <span className="text-[#16a34a] font-semibold">
                    {deck.retentionRate}%
                  </span>{" "}
                  nhớ
                </div>

                <button
                  type="button"
                  onClick={() => onStartPractice?.(deck.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-black group-hover:text-[#7e22ce] transition-colors cursor-pointer"
                >
                  <span>{hasDue ? "Ôn tập ngay" : "Luyện tập"}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
