import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Volume2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { libraryService } from "../services/libraryService";
import type { OfficialDeckCardItemDto } from "@wordstreak/shared-types";

export interface KnownWordTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: string;
  deckTitle: string;
  cards: OfficialDeckCardItemDto[];
  onTriageComplete: (result: { knownCount: number; unknownCount: number }) => void;
  isBeginnerMode?: boolean;
}

interface TriageDecision {
  cardId: string;
  isKnown: boolean;
}

export const KnownWordTriageModal: React.FC<KnownWordTriageModalProps> = ({
  isOpen,
  onClose,
  deckId,
  deckTitle,
  cards,
  onTriageComplete,
  isBeginnerMode = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<TriageDecision[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick verification popover quiz for beginner mode
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizTimeLeft, setQuizTimeLeft] = useState(3);
  const [quizFeedback, setQuizFeedback] = useState<{
    selected: string;
    isCorrect: boolean;
  } | null>(null);

  // Touch gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleClose = useCallback(() => {
    setCurrentIndex(0);
    setDecisions([]);
    setError(null);
    setShowQuiz(false);
    setQuizFeedback(null);
    onClose();
  }, [onClose]);

  const currentCard = cards[currentIndex];
  const isFinished = currentIndex >= cards.length;

  const knownCount = useMemo(
    () => decisions.filter((d) => d.isKnown).length,
    [decisions],
  );
  const unknownCount = useMemo(
    () => decisions.filter((d) => !d.isKnown).length,
    [decisions],
  );

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateQuizOptions = useCallback(
    (targetCard: OfficialDeckCardItemDto) => {
      const correctMeaning =
        targetCard.content.meaning_vi || targetCard.headword;
      const otherMeanings = cards
        .filter((c) => c.cardId !== targetCard.cardId)
        .map((c) => c.content.meaning_vi || c.headword)
        .filter((m) => m && m !== correctMeaning);

      // Pick up to 2 random distractors
      const shuffledDistractors = otherMeanings.sort(() => 0.5 - Math.random());
      const distractors = shuffledDistractors.slice(0, 2);

      const all = [correctMeaning, ...distractors].sort(
        () => 0.5 - Math.random(),
      );
      return all;
    },
    [cards],
  );

  const advanceWithDecision = useCallback(
    (isKnown: boolean) => {
      if (!currentCard) return;
      setDecisions((prev) => [
        ...prev,
        { cardId: currentCard.cardId, isKnown },
      ]);
      setShowQuiz(false);
      setQuizFeedback(null);
      setCurrentIndex((prev) => prev + 1);
    },
    [currentCard],
  );

  const handleMarkKnown = useCallback(() => {
    if (!currentCard || isFinished) return;

    if (isBeginnerMode && !showQuiz) {
      const options = generateQuizOptions(currentCard);
      setQuizOptions(options);
      setShowQuiz(true);
      return;
    }

    advanceWithDecision(true);
  }, [currentCard, isFinished, isBeginnerMode, showQuiz, generateQuizOptions, advanceWithDecision]);

  const handleMarkUnknown = useCallback(() => {
    if (!currentCard || isFinished) return;
    advanceWithDecision(false);
  }, [currentCard, isFinished, advanceWithDecision]);

  const handleUndo = useCallback(() => {
    if (currentIndex <= 0 || decisions.length === 0) return;
    setDecisions((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => prev - 1);
    setShowQuiz(false);
    setQuizTimeLeft(3);
    setQuizFeedback(null);
  }, [currentIndex, decisions.length]);

  // 3-second countdown timer for beginner verification quiz
  useEffect(() => {
    if (!showQuiz || quizFeedback) return;

    const timer = setInterval(() => {
      setQuizTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setQuizFeedback({ selected: "", isCorrect: false });
          setTimeout(() => {
            advanceWithDecision(false);
          }, 700);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showQuiz, quizFeedback, advanceWithDecision]);

  const handleQuizAnswer = (selectedOption: string) => {
    if (!currentCard || quizFeedback) return;
    const correctMeaning = currentCard.content.meaning_vi || currentCard.headword;
    const isCorrect = selectedOption === correctMeaning;

    setQuizFeedback({ selected: selectedOption, isCorrect });

    setTimeout(() => {
      advanceWithDecision(isCorrect);
    }, 700);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen || isFinished || showQuiz) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" || e.key === "K" || e.key === "ArrowRight") {
        e.preventDefault();
        handleMarkKnown();
      } else if (e.key === "u" || e.key === "U" || e.key === "ArrowLeft") {
        e.preventDefault();
        handleMarkUnknown();
      } else if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        handleUndo();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFinished, showQuiz, handleMarkKnown, handleMarkUnknown, handleUndo, handleClose]);

  // Touch gesture listeners
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || isFinished || showQuiz) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Minimum swipe threshold 50px
    if (diff > 50) {
      // Swiped Left -> Mark Unknown
      handleMarkUnknown();
    } else if (diff < -50) {
      // Swiped Right -> Mark Known
      handleMarkKnown();
    }
    setTouchStart(null);
  };

  const handleSaveTriage = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await libraryService.triageDeck(deckId, decisions);
      onTriageComplete({
        knownCount: response.knownCount,
        unknownCount: response.unknownCount,
      });
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể lưu kết quả lọc từ. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="triage-title"
    >
      <div className="relative w-full max-w-lg bg-[#ffffff] rounded-2xl border border-[#e5e5e5] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
          <div>
            <h2
              id="triage-title"
              className="text-base font-semibold text-[#090909] font-['Nunito',sans-serif]"
            >
              Lọc từ đã biết trước khi học
            </h2>
            <p className="text-xs text-neutral-500 truncate max-w-[280px]">
              {deckTitle}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Counters */}
        <div className="px-6 pt-3 pb-2 bg-neutral-50 border-b border-[#e5e5e5]">
          <div className="flex items-center justify-between text-xs text-neutral-600 mb-1.5 font-['JetBrains_Mono',monospace]">
            <span>
              Thẻ {Math.min(currentIndex + 1, cards.length)} / {cards.length}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-700 font-medium">
                Đã biết: {knownCount}
              </span>
              <span className="text-neutral-600">Cần học: {unknownCount}</span>
            </div>
          </div>
          <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-neutral-900 h-1.5 transition-all duration-200 ease-out rounded-full"
              style={{
                width: `${(Math.min(currentIndex, cards.length) / cards.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div
          className="p-6 flex-1 overflow-y-auto flex flex-col justify-center select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isFinished && currentCard && (
            <div className="flex flex-col items-center text-center space-y-4 py-2">
              {/* Word & Audio */}
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#090909] font-['Nunito',sans-serif]">
                  {currentCard.headword}
                </span>
                <button
                  type="button"
                  onClick={() => handleSpeak(currentCard.headword)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
                  aria-label="Phát âm"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* POS & IPA */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-full">
                  {currentCard.pos}
                </span>
                {currentCard.content.ipa_us && (
                  <span className="text-xs text-neutral-500 font-['JetBrains_Mono',monospace]">
                    {currentCard.content.ipa_us}
                  </span>
                )}
              </div>

              {/* Example sentence with lemma highlighted */}
              {currentCard.content.example_en && (
                <div className="w-full p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 text-left space-y-1.5">
                  <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                    Ví dụ ngữ cảnh
                  </p>
                  <p className="text-sm text-neutral-800 font-normal leading-relaxed">
                    {currentCard.content.example_en}
                  </p>
                </div>
              )}

              {/* Popover Quiz for Beginner Mode */}
              {showQuiz && (
                <div className="w-full p-4 mt-2 bg-amber-50/70 border border-amber-200 rounded-xl text-left space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between text-xs text-amber-900 font-medium">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Xác nhận nhanh: Từ này có nghĩa là gì?</span>
                    </div>
                    <span
                      data-testid="quiz-timer"
                      className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 font-mono text-[11px] font-semibold"
                    >
                      {quizTimeLeft}s
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {quizOptions.map((option, idx) => {
                      const isSelected = quizFeedback?.selected === option;
                      let btnStyle =
                        "bg-white border-neutral-200 text-neutral-800 hover:border-neutral-400";
                      if (isSelected) {
                        btnStyle = quizFeedback.isCorrect
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                          : "bg-red-50 border-red-500 text-red-800";
                      }
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuizAnswer(option)}
                          disabled={Boolean(quizFeedback)}
                          className={`w-full px-3.5 py-2 text-left text-xs rounded-lg border transition-all ${btnStyle}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Finished Summary State */}
          {isFinished && (
            <div className="flex flex-col items-center text-center space-y-5 py-4">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-900">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#090909] font-['Nunito',sans-serif]">
                  Đã phân loại xong 25 từ!
                </h3>
                <p className="text-xs text-neutral-500">
                  Lọc từ giúp bạn tiết kiệm thời gian và tập trung 100% vào từ mới.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-center space-y-1">
                  <p className="text-2xl font-bold text-neutral-900 font-['Nunito',sans-serif]">
                    {knownCount}
                  </p>
                  <p className="text-xs font-semibold text-emerald-700">Đã biết</p>
                  <p className="text-[11px] text-neutral-500 leading-tight">
                    Tính vào độ phủ, bỏ qua lặp lại
                  </p>
                </div>

                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-center space-y-1">
                  <p className="text-2xl font-bold text-neutral-900 font-['Nunito',sans-serif]">
                    {unknownCount}
                  </p>
                  <p className="text-xs font-semibold text-neutral-800">Cần học</p>
                  <p className="text-[11px] text-neutral-500 leading-tight">
                    Sẽ học trong các phiên SM-2
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveTriage}
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#000000] text-white text-sm font-semibold rounded-full hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <span>Đang lưu kết quả...</span>
                ) : (
                  <>
                    <span>Lưu & Bắt đầu học</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Modal Controls Footer (When not finished) */}
        {!isFinished && (
          <div className="px-6 py-4 border-t border-[#e5e5e5] bg-neutral-50/50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleUndo}
              disabled={currentIndex === 0}
              className="p-2 text-neutral-500 hover:text-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-full hover:bg-neutral-200 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Hoàn tác (Phím Z)"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Hoàn tác</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkUnknown}
                disabled={showQuiz}
                className="py-2 px-4 rounded-full border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-100 transition-colors text-xs font-medium flex items-center gap-1.5"
                title="Chưa biết (Phím U hoặc Mũi tên trái)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Chưa biết</span>
                <kbd className="hidden sm:inline text-[10px] px-1 bg-neutral-100 border border-neutral-300 rounded text-neutral-500">
                  U
                </kbd>
              </button>

              <button
                type="button"
                onClick={handleMarkKnown}
                disabled={showQuiz}
                className="py-2 px-4 rounded-full bg-[#000000] text-white hover:bg-neutral-800 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                title="Đã biết (Phím K hoặc Mũi tên phải)"
              >
                <span>Đã biết</span>
                <kbd className="hidden sm:inline text-[10px] px-1 bg-neutral-800 border border-neutral-700 rounded text-neutral-300">
                  K
                </kbd>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
