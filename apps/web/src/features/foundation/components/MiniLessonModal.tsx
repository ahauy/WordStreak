import React from "react";
import { X, BookOpen, Clock, Lightbulb, CheckCircle2, ArrowRight } from "lucide-react";
import type { MiniLesson } from "../data/foundationLessons";

interface MiniLessonModalProps {
  lesson: MiniLesson | null;
  isOpen: boolean;
  onClose: () => void;
  onStartDeck?: (deckOrder: number) => void;
}

export const MiniLessonModal: React.FC<MiniLessonModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onStartDeck,
}) => {
  if (!isOpen || !lesson) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mini-lesson-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#e5e5e5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#f0f0f0] flex items-start justify-between gap-4 bg-[#fafafa]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                <BookOpen className="w-3 h-3" />
                Bài học {lesson.order}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#737373] font-medium">
                <Clock className="w-3 h-3" />
                ~{lesson.estimatedMinutes} phút đọc
              </span>
            </div>
            <h2
              id="mini-lesson-title"
              className="text-xl sm:text-2xl font-bold tracking-tight text-black"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {lesson.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#737373]">
              {lesson.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bài học"
            className="p-2 rounded-full text-[#737373] hover:text-black hover:bg-neutral-200 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#262626]">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-[#e5e5e5] text-xs sm:text-sm leading-relaxed text-[#525252]">
            {lesson.content.summary}
          </div>

          {/* Key Points */}
          <div className="space-y-4">
            {lesson.content.keyPoints.map((kp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-[#e5e5e5] bg-white space-y-2"
              >
                <h3 className="font-bold text-sm text-black flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  {kp.heading}
                </h3>
                <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
                  {kp.explanation}
                </p>
                <div className="p-3 rounded-xl bg-[#fafafa] border border-[#f0f0f0] space-y-1">
                  <p className="text-xs font-semibold text-black">
                    Ví dụ: <span className="font-mono text-purple-700">{kp.example.en}</span>
                  </p>
                  <p className="text-xs text-[#737373] italic">
                    Dịch: {kp.example.vi}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tip Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
              {lesson.content.tip}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#f0f0f0] flex items-center justify-between gap-3 bg-[#fafafa]">
          <button
            type="button"
            onClick={onClose}
            className="text-xs sm:text-sm text-[#737373] hover:text-black font-semibold cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onStartDeck) {
                onStartDeck(lesson.relatedDeckOrder);
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <span>Tôi đã hiểu, vào học Chặng {lesson.relatedDeckOrder}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
