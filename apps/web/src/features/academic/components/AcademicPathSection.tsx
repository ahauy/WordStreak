import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, ChevronRight, Filter, Map } from "lucide-react";
import { NAWL_ACADEMIC_DECKS } from "../data/nawlDecks";
import type { AcademicDeck } from "../data/nawlDecks";

export interface AcademicPathSectionProps {
  onSelectDeck?: (deck: AcademicDeck) => void;
}

export const AcademicPathSection: React.FC<AcademicPathSectionProps> = ({ onSelectDeck }) => {
  const [selectedBand, setSelectedBand] = useState<"ALL" | "5.5-6.5" | "6.5-7.5" | "7.5+">("ALL");
  const [selectedTopic, setSelectedTopic] = useState<string>("ALL");
  const [activePreviewDeck, setActivePreviewDeck] = useState<AcademicDeck | null>(null);

  const topics = useMemo(() => {
    const list = Array.from(new Set(NAWL_ACADEMIC_DECKS.map((d) => d.topic)));
    return ["ALL", ...list];
  }, []);

  const filteredDecks = useMemo(() => {
    return NAWL_ACADEMIC_DECKS.filter((deck) => {
      const matchBand = selectedBand === "ALL" || deck.bandTarget === selectedBand;
      const matchTopic = selectedTopic === "ALL" || deck.topic.toLowerCase() === selectedTopic.toLowerCase();
      return matchBand && matchTopic;
    });
  }, [selectedBand, selectedTopic]);

  const totalWords = useMemo(() => {
    return filteredDecks.reduce((sum, d) => sum + d.cardsCount, 0);
  }, [filteredDecks]);

  return (
    <section className="mb-12" aria-label="Lộ trình Học thuật NAWL">
      {/* Banner giới thiệu lộ trình IELTS / Academic */}
      <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#000000] text-white">
                <GraduationCap className="w-3.5 h-3.5 text-white" />
                Lộ trình IELTS & Học thuật (NAWL 1.2)
              </span>
              <span className="text-xs font-mono text-[#737373] bg-white px-2 py-0.5 rounded border border-[#e5e5e5]">
                960 Academic Words
              </span>
            </div>
            <h2 className="font-nunito font-extrabold text-2xl text-[#090909]">
              Từ vựng Học thuật Chuyên sâu cho IELTS Writing & Reading
            </h2>
            <p className="text-sm text-[#525252] max-w-2xl leading-relaxed">
              Dựa trên nghiên cứu New Academic Word List (NAWL) của Browne, Culligan & Phillips (2014),
              chiếm đến 92% độ phủ từ vựng trong các bài báo khoa học và đề thi IELTS Academic.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-[#e5e5e5]">
            <span className="text-xs font-mono text-[#737373]">Độ phủ hiển thị</span>
            <div className="text-2xl font-extrabold font-nunito text-[#090909]">
              {totalWords} <span className="text-sm font-normal text-[#737373]">từ học thuật</span>
            </div>
            <Link
              to="/paths/academic"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#000000] text-white hover:bg-[#262626] transition-colors mt-2"
            >
              <Map className="w-3.5 h-3.5" /> Bản đồ 32 Chặng IELTS
            </Link>
          </div>
        </div>

        {/* Bộ lọc Band điểm & Chủ đề */}
        <div className="mt-6 pt-6 border-t border-[#e5e5e5] flex flex-wrap items-center gap-4">
          {/* Target Band Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#737373] font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Target Band:
            </span>
            {(["ALL", "5.5-6.5", "6.5-7.5", "7.5+"] as const).map((band) => (
              <button
                key={band}
                onClick={() => setSelectedBand(band)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  selectedBand === band
                    ? "bg-[#000000] text-white shadow-sm"
                    : "bg-white text-[#525252] border border-[#e5e5e5] hover:border-[#000000]"
                }`}
              >
                {band === "ALL" ? "Tất cả Band" : `Band ${band}`}
              </button>
            ))}
          </div>

          {/* Topic Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#737373] font-medium mr-1">Chủ đề:</span>
            {topics.map((top) => (
              <button
                key={top}
                onClick={() => setSelectedTopic(top)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  selectedTopic === top
                    ? "bg-[#000000] text-white shadow-sm"
                    : "bg-white text-[#525252] border border-[#e5e5e5] hover:border-[#000000]"
                }`}
              >
                {top === "ALL" ? "Tất cả chủ đề" : top}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lưới danh sách bộ thẻ NAWL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDecks.map((deck) => (
          <div
            key={deck.id}
            className="group bg-white border border-[#e5e5e5] rounded-xl p-5 hover:border-[#000000] transition-colors relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fafafa] border border-[#e5e5e5] text-[#090909]">
                  Band {deck.bandTarget}
                </span>
                <span className="text-xs font-mono text-[#737373]">
                  {deck.cardsCount} thẻ từ vựng
                </span>
              </div>

              <h3 className="font-nunito font-bold text-lg text-[#090909] group-hover:text-black mb-1">
                {deck.titleVi}
              </h3>
              <p className="text-xs font-mono text-[#737373] mb-2">{deck.title}</p>
              <p className="text-xs text-[#525252] leading-relaxed mb-4">
                {deck.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#f5f5f5]">
              <button
                onClick={() => setActivePreviewDeck(deck)}
                className="text-xs font-medium text-[#525252] hover:text-black flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" /> Xem trước {deck.cardsCount} từ
              </button>

              <button
                onClick={() => onSelectDeck?.(deck)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#000000] text-white hover:bg-[#262626] transition-colors"
              >
                Học bộ này <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal súc tích chuẩn Ponytail */}
      {activePreviewDeck && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#e5e5e5] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-[#e5e5e5] flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-[#737373] uppercase tracking-wider">
                  Xem trước Thẻ Học thuật · Band {activePreviewDeck.bandTarget}
                </span>
                <h3 className="font-nunito font-extrabold text-xl text-[#090909]">
                  {activePreviewDeck.titleVi}
                </h3>
              </div>
              <button
                onClick={() => setActivePreviewDeck(null)}
                className="text-sm font-semibold px-3 py-1.5 rounded-full border border-[#e5e5e5] hover:bg-[#f5f5f5]"
              >
                Đóng
              </button>
            </div>

            {/* Danh sách thẻ từ */}
            <div className="overflow-y-auto p-5 space-y-3 divide-y divide-[#f5f5f5]">
              {activePreviewDeck.cards.map((card, idx) => (
                <div key={card.word} className={idx > 0 ? "pt-3" : ""}>
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-nunito font-bold text-base text-[#090909]">
                        {card.word}
                      </span>
                      <span className="text-[11px] font-mono text-[#737373] italic">
                        ({card.pos})
                      </span>
                      <span className="text-xs font-mono text-[#525252]">
                        {card.ipa}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#fafafa] border border-[#e5e5e5] text-[#525252]">
                      Band {card.bandTarget}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-[#090909] mb-1">
                    {card.meaningVi}
                  </p>
                  <p className="text-xs text-[#525252] italic mb-1.5">
                    "{card.exampleEn}"
                  </p>

                  {card.collocations && card.collocations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {card.collocations.map((col) => (
                        <span
                          key={col}
                          className="text-[10px] bg-[#fafafa] text-[#525252] border border-[#e5e5e5] px-1.5 py-0.5 rounded"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-[#fafafa] border-t border-[#e5e5e5] flex items-center justify-between">
              <span className="text-xs text-[#737373]">
                Tổng cộng {activePreviewDeck.cards.length} từ vựng học thuật chuẩn hóa
              </span>
              <button
                onClick={() => {
                  onSelectDeck?.(activePreviewDeck);
                  setActivePreviewDeck(null);
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#000000] text-white hover:bg-[#262626]"
              >
                Bắt đầu học ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
