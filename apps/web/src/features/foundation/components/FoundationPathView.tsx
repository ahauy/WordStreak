import React, { useState } from "react";
import { BookOpen, ArrowRight, ChevronRight, Compass } from "lucide-react";
import { FOUNDATION_DECKS, type FoundationDeck } from "../data/foundationDecks";
import { FOUNDATION_MINI_LESSONS, type MiniLesson } from "../data/foundationLessons";
import { MiniLessonModal } from "./MiniLessonModal";

interface FoundationPathViewProps {
  onSelectDeck?: (deck: FoundationDeck) => void;
}

export const FoundationPathView: React.FC<FoundationPathViewProps> = ({
  onSelectDeck,
}) => {
  const [activeLesson, setActiveLesson] = useState<MiniLesson | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);

  const handleOpenLesson = (lesson: MiniLesson) => {
    setActiveLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const lessonMap = new Map<number, MiniLesson>();
  FOUNDATION_MINI_LESSONS.forEach((l) => {
    lessonMap.set(l.relatedDeckOrder, l);
  });

  return (
    <div className="space-y-8" data-testid="foundation-path-view">
      {/* Path Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50/60 to-white space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Compass className="w-3.5 h-3.5 text-purple-700" />
            Lộ trình Chuyên biệt · Persona Nam
          </span>
          <span className="text-xs text-[#737373]">
            300 từ vựng cốt lõi NGSL 1.2 · Duyệt tay 100%
          </span>
        </div>

        <div className="space-y-2">
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            Chặng Khởi động cho Người Mất gốc
          </h2>
          <p className="text-xs sm:text-sm text-[#525252] max-w-3xl leading-relaxed">
            Thiết kế riêng cho người đã lâu không dùng tiếng Anh hoặc bắt đầu lại từ con số 0.
            Lộ trình chia nhỏ thành 15 chặng bậc thang (20 từ/chặng) với tốc độ thong thả 5 từ/ngày,
            kết hợp 4 bài học ngữ pháp cực ngắn $\le 2$ phút giúp bạn lấy lại tự tin ngay từ tuần đầu tiên.
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white border border-[#e5e5e5] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-sm shrink-0">
              15
            </div>
            <div>
              <p className="text-xs font-bold text-black">Chặng bậc thang</p>
              <p className="text-[11px] text-[#737373]">20 từ sinh tồn / chặng</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#e5e5e5] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-sm shrink-0">
              4
            </div>
            <div>
              <p className="text-xs font-bold text-black">Bài học ngắn $\le 2$ phút</p>
              <p className="text-[11px] text-[#737373]">100% tiếng Việt dễ hiểu</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#e5e5e5] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-sm shrink-0">
              5
            </div>
            <div>
              <p className="text-xs font-bold text-black">Tốc độ 5 từ / ngày</p>
              <p className="text-[11px] text-[#737373]">Thong thả, không ngợp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stepped Progression Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3
            className="text-lg font-bold text-black"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            Lộ trình 15 Chặng Bậc Thang
          </h3>
          <span className="text-xs text-[#737373]">
            Học tuần tự để đạt kết quả ghi nhớ cao nhất
          </span>
        </div>

        <div className="relative border-l-2 border-purple-200 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8">
          {FOUNDATION_DECKS.map((deck) => {
            const linkedLesson = lessonMap.get(deck.order);

            return (
              <div key={deck.id} className="relative space-y-3" data-testid={`stage-step-${deck.order}`}>
                {/* Stepped Marker */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full bg-white border-2 border-purple-600 text-purple-800 font-bold text-xs flex items-center justify-center shadow-xs">
                  {deck.order}
                </div>

                {/* Optional Mini-Lesson Trigger */}
                {linkedLesson && (
                  <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-200 text-purple-900 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-900 uppercase tracking-wider">
                            Bài học mở đầu ({linkedLesson.estimatedMinutes} phút)
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-black mt-0.5">
                          {linkedLesson.title} — {linkedLesson.subtitle}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenLesson(linkedLesson)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      <span>Xem bài học</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Deck Card */}
                <div className="p-5 rounded-2xl border border-[#e5e5e5] bg-white hover:border-[#d4d4d4] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fafafa] border border-[#e5e5e5] text-[#525252]">
                        {deck.category}
                      </span>
                      <span className="text-xs text-[#737373]">
                        {deck.wordCount} từ vựng
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-black">
                      {deck.titleVi}
                    </h4>
                    <p className="text-xs text-[#737373]">
                      {deck.titleEn}
                    </p>

                    {/* Word Chips Preview */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                      {deck.sampleWords.slice(0, 6).map((word) => (
                        <span
                          key={word}
                          className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-neutral-100 text-[#262626]"
                        >
                          {word}
                        </span>
                      ))}
                      {deck.sampleWords.length > 6 && (
                        <span className="text-[11px] text-[#737373]">
                          +{deck.sampleWords.length - 6} từ khác
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectDeck && onSelectDeck(deck)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <span>Vào học chặng này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini Lesson Modal */}
      <MiniLessonModal
        lesson={activeLesson}
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onStartDeck={(deckOrder) => {
          const targetDeck = FOUNDATION_DECKS.find((d) => d.order === deckOrder);
          if (targetDeck && onSelectDeck) {
            onSelectDeck(targetDeck);
          }
        }}
      />
    </div>
  );
};
