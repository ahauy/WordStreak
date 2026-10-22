import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Volume2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import {
  GUEST_SAMPLE_CARDS,
  getGuestPreviewState,
  recordGuestRating,
  clearGuestPreviewState,
} from "../utils/guestStorage";

export const GuestFlashcardPreview: React.FC = () => {
  const [state, setState] = useState(getGuestPreviewState());
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    setState(getGuestPreviewState());
  }, []);

  const cardIndex = Math.min(state.currentIndex, GUEST_SAMPLE_CARDS.length - 1);
  const currentCard = GUEST_SAMPLE_CARDS[cardIndex];

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;

    setIsPlayingAudio(true);
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentCard.word);
      utterance.rate = 0.88;
      utterance.lang = "en-US";
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 800);
    }
  };

  const handleRate = (rating: number) => {
    if (!currentCard) return;
    const nextState = recordGuestRating(currentCard.id, rating);
    setState(nextState);
    setIsFlipped(false);
  };

  const handleReset = () => {
    clearGuestPreviewState();
    setState(getGuestPreviewState());
    setIsFlipped(false);
  };

  if (state.isCompleted) {
    return (
      <div className="w-full max-w-xl mx-auto rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] animate-in fade-in duration-300">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#faf5ff] text-[#7e22ce] border border-[#f3e8ff] mb-4">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3
          className="text-xl sm:text-2xl font-bold text-black"
          style={{ fontFamily: "var(--font-display, Nunito, sans-serif)" }}
        >
          Bạn đã hoàn thành 5 từ học thử!
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-[#737373] max-w-md mx-auto leading-relaxed">
          Tiến độ học 5 từ này đã được lưu cục bộ. Hãy tạo tài khoản miễn phí để lưu vào lộ trình học tập chính thức và bắt đầu chuỗi ngày học của bạn.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-[#262626] shadow-xs cursor-pointer"
          >
            <span>Đăng ký miễn phí để lưu tiến độ</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-transparent px-4 py-2.5 text-xs sm:text-sm font-medium text-[#737373] hover:text-black hover:border-[#d4d4d4] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Học lại từ đầu</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Stable Outer Anchor */}
      <div className="pt-1 -mt-1 pb-1 -mb-1">
        <div className="relative rounded-3xl border border-[#e5e5e5] bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#f5f5f5] mb-5 text-xs text-[#737373]">
            <span className="font-mono uppercase tracking-wider text-[11px] font-medium text-[#a3a3a3]">
              Học thử miễn phí · Thẻ {state.currentIndex + 1} / {GUEST_SAMPLE_CARDS.length}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#7e22ce] bg-[#faf5ff] border border-[#f3e8ff] px-2 py-0.5 rounded-full font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Chế độ Khách
            </span>
          </div>

          {/* Flashcard Body */}
          <div className="min-h-[180px] flex flex-col justify-center">
            {!isFlipped ? (
              /* Front Face */
              <div className="space-y-4 text-center">
                <div>
                  <h3
                    className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black"
                    style={{ fontFamily: "var(--font-display, Nunito, sans-serif)" }}
                  >
                    {currentCard.word}
                  </h3>
                  <div className="mt-2 flex items-center justify-center gap-2 text-sm text-[#737373]">
                    <span className="font-mono text-[#525252]">{currentCard.ipa}</span>
                    <span>·</span>
                    <span className="italic uppercase text-xs font-mono px-2 py-0.5 rounded-full bg-[#fafafa] border border-[#e5e5e5]">
                      {currentCard.pos}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handlePlayAudio}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-black hover:border-black transition-colors cursor-pointer"
                    title="Phát âm"
                  >
                    <Volume2 className={`h-4 w-4 ${isPlayingAudio ? "animate-pulse text-[#7e22ce]" : ""}`} />
                  </button>
                </div>
              </div>
            ) : (
              /* Back Face */
              <div className="space-y-3.5 text-left animate-in fade-in duration-200">
                <div>
                  <span className="text-[11px] font-mono uppercase text-[#a3a3a3]">Nghĩa tiếng Việt</span>
                  <p className="text-base sm:text-lg font-bold text-black mt-0.5">
                    {currentCard.definitionVi}
                  </p>
                  <p className="text-xs text-[#737373] mt-0.5">
                    {currentCard.definitionEn}
                  </p>
                </div>

                <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3 text-xs">
                  <span className="text-[11px] font-mono text-[#a3a3a3] uppercase block mb-1">Ví dụ ngữ cảnh</span>
                  <p className="font-medium text-[#262626] italic">
                    &ldquo;{currentCard.exampleEn}&rdquo;
                  </p>
                  <p className="text-[#737373] mt-1">
                    {currentCard.exampleVi}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-5 border-t border-[#f5f5f5]">
            {!isFlipped ? (
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="w-full cursor-pointer rounded-full bg-black py-2.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-[#262626] shadow-xs text-center"
              >
                Lật thẻ xem nghĩa
              </button>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleRate(1)}
                  className="cursor-pointer rounded-full border border-red-200 bg-red-50/50 py-2 text-[11px] font-semibold text-red-700 hover:bg-red-100/60 transition-colors text-center"
                >
                  Quên
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(2)}
                  className="cursor-pointer rounded-full border border-amber-200 bg-amber-50/50 py-2 text-[11px] font-semibold text-amber-700 hover:bg-amber-100/60 transition-colors text-center"
                >
                  Khó
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(3)}
                  className="cursor-pointer rounded-full border border-blue-200 bg-blue-50/50 py-2 text-[11px] font-semibold text-blue-700 hover:bg-blue-100/60 transition-colors text-center"
                >
                  Nhớ tốt
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(4)}
                  className="cursor-pointer rounded-full border border-emerald-200 bg-emerald-50/50 py-2 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100/60 transition-colors text-center"
                >
                  Quá dễ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
