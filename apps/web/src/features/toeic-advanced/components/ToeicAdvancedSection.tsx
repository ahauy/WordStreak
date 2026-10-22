import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Camera,
  CheckCircle2,
  X,
  HelpCircle,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import {
  TOEIC_COLLOCATIONS_DECKS,
  type CollocationDeck,
  type CollocationItem,
} from "../data/collocationsDecks";
import {
  TOEIC_PHOTO_DECKS_PART1,
  type PhotoDeckPart1,
  type PhotoItemPart1,
} from "../data/photoDecksPart1";
import {
  PART5_WORD_FORM_LESSON,
} from "../data/part5TipsLesson";

type ModalViewType = "deck-preview" | "part5-lesson" | null;

interface ActiveDeckPreview {
  title: string;
  badge: string;
  items: (CollocationItem | PhotoItemPart1)[];
}

export const ToeicAdvancedSection: React.FC = () => {
  const [modalType, setModalType] = useState<ModalViewType>(null);
  const [activeDeck, setActiveDeck] = useState<ActiveDeckPreview | null>(null);

  // Part 5 interactive check answers state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  const handleOpenDeck = (deck: CollocationDeck | PhotoDeckPart1) => {
    setActiveDeck({
      title: deck.titleVi,
      badge: deck.badge,
      items: deck.items,
    });
    setModalType("deck-preview");
  };

  const handleSelectQuizOption = (questionId: string, option: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#e5e5e5] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#000000] text-[#ffffff]">
              Mô-đun Nâng cao
            </span>
            <span className="text-xs text-[#737373] font-medium">
              Chuyên biệt cho kỳ thi TOEIC
            </span>
          </div>
          <h2 className="font-['Nunito',sans-serif] font-extrabold text-xl sm:text-2xl text-[#000000]">
            Bộ Từ Vựng Chuyên Biệt & Chiến Thuật Điểm Cao
          </h2>
        </div>
        <p className="text-xs text-[#737373] sm:text-right max-w-sm">
          100 Cụm từ cố định, 50 Từ vựng tranh Part 1 và Chiến thuật loại trừ dạng từ Part 5 trong 2 phút.
        </p>
      </div>

      {/* Part 5 Strategy Banner Card */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#000000] text-white">
              {PART5_WORD_FORM_LESSON.badge}
            </span>
            <span className="text-xs font-mono text-[#737373]">
              ~{PART5_WORD_FORM_LESSON.estimatedMinutes} phút học
            </span>
          </div>
          <h3 className="font-['Nunito',sans-serif] font-bold text-base sm:text-lg text-[#000000]">
            {PART5_WORD_FORM_LESSON.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#525252] max-w-2xl leading-relaxed">
            {PART5_WORD_FORM_LESSON.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalType("part5-lesson")}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#000000] text-[#ffffff] hover:bg-[#1a1a1a] transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Xem chiến thuật 2 phút</span>
        </button>
      </div>

      {/* 2-Column Grid: Collocations vs Part 1 Photos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Fixed Collocations Decks (4 decks, 100 items) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#000000]" />
            <h3 className="font-['Nunito',sans-serif] font-bold text-sm sm:text-base text-[#000000]">
              100 Cụm từ cố định Part 5 & 6 (Fixed Collocations)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TOEIC_COLLOCATIONS_DECKS.map((deck) => (
              <div
                key={deck.id}
                className="p-4 rounded-xl border border-[#e5e5e5] bg-[#ffffff] hover:border-[#000000] transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#fafafa] border border-[#e5e5e5] text-[#525252]">
                      {deck.badge}
                    </span>
                    <span className="text-[11px] font-mono text-[#737373]">
                      {deck.itemCount} cụm
                    </span>
                  </div>
                  <h4 className="font-['Nunito',sans-serif] font-bold text-sm text-[#000000]">
                    {deck.titleVi}
                  </h4>
                  <p className="text-xs text-[#737373] line-clamp-2 leading-relaxed">
                    {deck.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenDeck(deck)}
                  className="w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-full text-xs font-semibold border border-[#e5e5e5] hover:border-[#000000] text-[#000000] bg-[#fafafa] hover:bg-[#ffffff] transition-all cursor-pointer"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Xem danh sách cụm từ</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Part 1 Photo Vocabulary (2 decks, 50 items) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#000000]" />
            <h3 className="font-['Nunito',sans-serif] font-bold text-sm sm:text-base text-[#000000]">
              50 Cụm Từ Miêu Tả Tranh Part 1 (Photo Decks)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TOEIC_PHOTO_DECKS_PART1.map((deck) => (
              <div
                key={deck.id}
                className="p-4 rounded-xl border border-[#e5e5e5] bg-[#ffffff] hover:border-[#000000] transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#fafafa] border border-[#e5e5e5] text-[#525252]">
                      {deck.badge}
                    </span>
                    <span className="text-[11px] font-mono text-[#737373]">
                      {deck.itemCount} cụm
                    </span>
                  </div>
                  <h4 className="font-['Nunito',sans-serif] font-bold text-sm text-[#000000]">
                    {deck.titleVi}
                  </h4>
                  <p className="text-xs text-[#737373] line-clamp-2 leading-relaxed">
                    {deck.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenDeck(deck)}
                  className="w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-full text-xs font-semibold border border-[#e5e5e5] hover:border-[#000000] text-[#000000] bg-[#fafafa] hover:bg-[#ffffff] transition-all cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  <span>Xem danh sách từ tranh</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Deck Preview List */}
      {modalType === "deck-preview" && activeDeck && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setModalType(null)}
        >
          <div
            className="w-full max-w-2xl bg-white border border-[#e5e5e5] rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fafafa]">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white">
                  {activeDeck.badge}
                </span>
                <h3 className="font-['Nunito',sans-serif] font-bold text-base text-[#000000] mt-1">
                  {activeDeck.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                aria-label="Đóng cửa sổ"
                className="p-1 rounded-full text-[#737373] hover:text-black hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Items List */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1 divide-y divide-[#f0f0f0]">
              {activeDeck.items.map((item, idx) => (
                <div key={item.id} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-['Nunito',sans-serif] font-bold text-sm text-[#000000]">
                      {idx + 1}. {item.phrase}
                    </span>
                    {"pattern" in item && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#fafafa] border border-[#e5e5e5] text-[#737373]">
                        {item.pattern}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#000000]">
                    {item.meaningVi}
                  </p>
                  <p className="text-xs text-[#737373] italic">
                    &ldquo;{item.exampleEn}&rdquo;
                  </p>
                  <p className="text-[11px] text-[#a3a3a3]">
                    {item.exampleVi}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-[#e5e5e5] bg-[#fafafa] flex justify-end">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-black text-white hover:bg-[#1a1a1a] cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Part 5 Strategy Interactive Lesson */}
      {modalType === "part5-lesson" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setModalType(null)}
        >
          <div
            className="w-full max-w-3xl bg-white border border-[#e5e5e5] rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between bg-[#fafafa]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white">
                  Part 5 Strategy
                </span>
                <h3 className="font-['Nunito',sans-serif] font-bold text-base text-[#000000]">
                  {PART5_WORD_FORM_LESSON.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                aria-label="Đóng bài học"
                className="p-1 rounded-full text-[#737373] hover:text-black hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lesson Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              {/* Section 1: Rules */}
              <div className="space-y-3">
                <h4 className="font-['Nunito',sans-serif] font-bold text-sm text-[#000000] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>4 Vị Trí Vàng Nhận Diện Chỗ Trống Part 5</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PART5_WORD_FORM_LESSON.rules.map((rule) => (
                    <div
                      key={rule.number}
                      className="p-3.5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] space-y-1.5"
                    >
                      <p className="font-bold text-xs text-[#000000]">
                        {rule.number}. {rule.title}
                      </p>
                      <p className="text-[11px] text-[#525252]">
                        {rule.description}
                      </p>
                      <div className="p-1.5 rounded-lg bg-white border border-[#e5e5e5] font-mono text-[10px] text-black">
                        {rule.formula}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Suffix Rules */}
              <div className="space-y-3">
                <h4 className="font-['Nunito',sans-serif] font-bold text-sm text-[#000000]">
                  Bảng Nhận Diện Hậu Tố Từ Loại (Suffixes)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PART5_WORD_FORM_LESSON.suffixRules.map((s) => (
                    <div
                      key={s.pos}
                      className="p-3.5 rounded-xl border border-[#e5e5e5] bg-white space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-black">{s.pos}</span>
                        <span className="text-[10px] text-[#737373]">{s.posVi}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {s.suffixes.map((suf) => (
                          <span
                            key={suf}
                            className="px-1.5 py-0.5 rounded-md bg-[#fafafa] border border-[#e5e5e5] font-mono text-[10px]"
                          >
                            {suf}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-[#737373]">{s.tips}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Traps */}
              <div className="space-y-3">
                <h4 className="font-['Nunito',sans-serif] font-bold text-sm text-[#000000]">
                  Cặp Bẫy Kinh Điển Cần Tránh
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PART5_WORD_FORM_LESSON.commonTraps.map((trap, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2"
                    >
                      <p className="font-bold text-xs text-purple-900">{trap.trapName}</p>
                      <p className="text-[11px] text-purple-950">{trap.explanation}</p>
                      <div className="p-2 rounded-lg bg-white border border-purple-100 space-y-1 text-[11px]">
                        <p className="font-medium text-black">
                          • {trap.comparison.left} ({trap.comparison.leftNote})
                        </p>
                        <p className="font-medium text-black">
                          • {trap.comparison.right} ({trap.comparison.rightNote})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Interactive Quick Check */}
              <div className="space-y-3 pt-2 border-t border-[#e5e5e5]">
                <h4 className="font-['Nunito',sans-serif] font-bold text-sm text-[#000000] flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-black" />
                  <span>Luyện Tập Phản Xạ 15 Giây</span>
                </h4>

                <div className="space-y-4">
                  {PART5_WORD_FORM_LESSON.interactiveCheck.map((q) => {
                    const chosen = quizAnswers[q.id];
                    const isAnswered = Boolean(chosen);
                    const isCorrect = chosen === q.correctOption;

                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] space-y-3"
                      >
                        <p className="font-medium text-xs sm:text-sm text-[#000000]">
                          {q.sentence}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {q.options.map((opt) => {
                            const isThisOption = chosen === opt.label;
                            return (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => handleSelectQuizOption(q.id, opt.label)}
                                className={`p-2 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer ${
                                  isThisOption
                                    ? isCorrect
                                      ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                                      : "bg-red-50 border-red-400 text-red-800"
                                    : "bg-white border-[#e5e5e5] hover:border-black text-[#000000]"
                                }`}
                              >
                                <span className="font-bold">({opt.label})</span> {opt.text}
                              </button>
                            );
                          })}
                        </div>

                        {isAnswered && (
                          <div
                            className={`p-3 rounded-xl text-xs ${
                              isCorrect
                                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                                : "bg-neutral-100 text-neutral-800 border border-neutral-300"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold mb-1">
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Chính xác! Đáp án đúng là {q.correctOption}</span>
                                </>
                              ) : (
                                <span>Chưa chính xác. Đáp án đúng là {q.correctOption}</span>
                              )}
                            </div>
                            <p className="text-[11px] leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[#e5e5e5] bg-[#fafafa] flex justify-end">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-black text-white hover:bg-[#1a1a1a] cursor-pointer"
              >
                Hoàn thành bài học
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
