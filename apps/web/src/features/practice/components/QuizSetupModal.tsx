import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Clock,
  Sparkles,
  AlertCircle,
  Headphones,
  Layers,
  Mic,
} from "lucide-react";

export type PracticeMode =
  | "multiple-choice"
  | "fill-in-the-blank"
  | "listening"
  | "matching"
  | "pronunciation";

interface QuizSetupModalProps {
  isOpen: boolean;
  deckTitle: string;
  totalCards: number;
  onClose: () => void;
  onStart: (options: {
    mode: PracticeMode;
    limit: number;
    isZenMode: boolean;
  }) => void;
}

export const QuizSetupModal: React.FC<QuizSetupModalProps> = ({
  isOpen,
  deckTitle,
  totalCards,
  onClose,
  onStart,
}) => {
  const [selectedMode, setSelectedMode] =
    useState<PracticeMode>("multiple-choice");
  const [selectedLimit, setSelectedLimit] = useState<number>(10);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isMultipleChoiceTooSmall =
    selectedMode === "multiple-choice" && totalCards < 4;
  const isFillBlankEmpty =
    selectedMode === "fill-in-the-blank" && totalCards < 1;
  const isListeningEmpty = selectedMode === "listening" && totalCards < 1;
  const isMatchingTooSmall = selectedMode === "matching" && totalCards < 5;
  const isPronunciationEmpty =
    selectedMode === "pronunciation" && totalCards < 1;
  const isTooSmall =
    isMultipleChoiceTooSmall ||
    isFillBlankEmpty ||
    isListeningEmpty ||
    isMatchingTooSmall ||
    isPronunciationEmpty;

  const handleStart = () => {
    onStart({
      mode: selectedMode,
      limit: selectedLimit,
      isZenMode,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quiz-setup-title"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-lg bg-white border border-[#e5e5e5] rounded-3xl p-6 sm:p-7 shadow-xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#9333ea]" />
              <h2
                id="quiz-setup-title"
                className="text-lg font-bold font-display text-[#000000]"
              >
                Practice Quiz
              </h2>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-full text-[#737373] hover:text-[#000000] hover:bg-[#fafafa] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-5 space-y-5">
            {/* Practice Mode Selector */}
            <div>
              <span className="text-xs font-mono text-[#737373] uppercase tracking-wider block mb-2">
                Chế độ ôn luyện (Practice Mode)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedMode("multiple-choice")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedMode === "multiple-choice"
                      ? "bg-[#000000] text-white border-[#000000] shadow-sm"
                      : "bg-[#fafafa] text-[#000000] border-[#e5e5e5] hover:border-[#d4d4d4]"
                  }`}
                >
                  <span className="block text-sm font-semibold leading-tight">
                    Trắc nghiệm
                  </span>
                  <span
                    className={`block text-[11px] font-mono mt-1 ${
                      selectedMode === "multiple-choice"
                        ? "text-white/70"
                        : "text-[#737373]"
                    }`}
                  >
                    4 Choices
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode("fill-in-the-blank")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedMode === "fill-in-the-blank"
                      ? "bg-[#000000] text-white border-[#000000] shadow-sm"
                      : "bg-[#fafafa] text-[#000000] border-[#e5e5e5] hover:border-[#d4d4d4]"
                  }`}
                >
                  <span className="block text-sm font-semibold leading-tight">
                    Điền từ
                  </span>
                  <span
                    className={`block text-[11px] font-mono mt-1 ${
                      selectedMode === "fill-in-the-blank"
                        ? "text-white/70"
                        : "text-[#737373]"
                    }`}
                  >
                    Fill in Blank
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode("listening")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedMode === "listening"
                      ? "bg-[#000000] text-white border-[#000000] shadow-sm"
                      : "bg-[#fafafa] text-[#000000] border-[#e5e5e5] hover:border-[#d4d4d4]"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="block text-sm font-semibold leading-tight">
                      Luyện nghe
                    </span>
                    <Headphones className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  </div>
                  <span
                    className={`block text-[11px] font-mono mt-1 ${
                      selectedMode === "listening"
                        ? "text-white/70"
                        : "text-[#737373]"
                    }`}
                  >
                    Audio & Typing
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode("matching")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedMode === "matching"
                      ? "bg-[#000000] text-white border-[#000000] shadow-sm"
                      : "bg-[#fafafa] text-[#000000] border-[#e5e5e5] hover:border-[#d4d4d4]"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="block text-sm font-semibold leading-tight">
                      Nối từ
                    </span>
                    <Layers className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  </div>
                  <span
                    className={`block text-[11px] font-mono mt-1 ${
                      selectedMode === "matching"
                        ? "text-white/70"
                        : "text-[#737373]"
                    }`}
                  >
                    Matching
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode("pronunciation")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedMode === "pronunciation"
                      ? "bg-[#000000] text-white border-[#000000] shadow-sm"
                      : "bg-[#fafafa] text-[#000000] border-[#e5e5e5] hover:border-[#d4d4d4]"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="block text-sm font-semibold leading-tight">
                      Phát âm
                    </span>
                    <Mic className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  </div>
                  <span
                    className={`block text-[11px] font-mono mt-1 ${
                      selectedMode === "pronunciation"
                        ? "text-white/70"
                        : "text-[#737373]"
                    }`}
                  >
                    Voice Studio
                  </span>
                </button>
              </div>
            </div>

            {/* Deck info */}
            <div>
              <span className="text-xs font-mono text-[#737373] uppercase tracking-wider block mb-1">
                Deck
              </span>
              <p className="text-base font-semibold text-[#000000] truncate">
                {deckTitle}
              </p>
            </div>

            {/* Warning if deck has insufficient cards */}
            {isTooSmall ? (
              <div className="p-4 bg-[#fef2f2] border border-[#ef4444]/30 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
                <div className="text-xs text-[#991b1b] leading-relaxed">
                  <span className="font-semibold block text-sm mb-0.5">
                    Not enough cards
                  </span>
                  {selectedMode === "multiple-choice"
                    ? `This deck has only ${totalCards} cards. Multiple choice quizzes require at least 4 cards across your account to generate options.`
                    : selectedMode === "matching"
                      ? `Bộ thẻ chỉ có ${totalCards} thẻ. Chế độ nối từ yêu cầu tối thiểu 5 thẻ từ vựng.`
                      : selectedMode === "pronunciation"
                        ? "This deck has no cards. Add cards to start pronunciation practice."
                        : selectedMode === "listening"
                          ? "This deck has no cards. Add cards to start listening & typing practice."
                          : "This deck has no cards. Add cards to start fill-in-the-blank practice."}
                </div>
              </div>
            ) : (
              <>
                {/* Question Count Presets */}
                <div>
                  <span className="text-xs font-mono text-[#737373] uppercase tracking-wider block mb-2.5">
                    Question Count
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      {
                        label:
                          selectedMode === "matching"
                            ? "5 Thẻ (1 Vòng)"
                            : "10 Cards",
                        count: selectedMode === "matching" ? 5 : 10,
                        sub: selectedMode === "matching" ? "1 Round" : "~2 min",
                      },
                      {
                        label:
                          selectedMode === "matching"
                            ? "10 Thẻ (2 Vòng)"
                            : "20 Cards",
                        count: selectedMode === "matching" ? 10 : 20,
                        sub:
                          selectedMode === "matching" ? "2 Rounds" : "~5 min",
                      },
                      {
                        label: "All Cards",
                        count: totalCards,
                        sub: `${totalCards} cards`,
                      },
                    ].map((preset) => {
                      const isSelected = selectedLimit === preset.count;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setSelectedLimit(preset.count)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            isSelected
                              ? "bg-[#000000] text-white border-[#000000] shadow-sm"
                              : "bg-[#fafafa] text-[#000000] border-[#e5e5e5] hover:border-[#d4d4d4]"
                          }`}
                        >
                          <span className="block text-sm font-semibold leading-tight">
                            {preset.label}
                          </span>
                          <span
                            className={`block text-[11px] font-mono mt-1 ${
                              isSelected ? "text-white/70" : "text-[#737373]"
                            }`}
                          >
                            {preset.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Zen Mode Toggle */}
                <div className="p-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#737373]" />
                    <div>
                      <span className="text-sm font-semibold text-[#000000] block">
                        Zen Mode
                      </span>
                      <span className="text-xs text-[#737373]">
                        Disable 15s timer for stress-free practice
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isZenMode}
                    onClick={() => setIsZenMode(!isZenMode)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      isZenMode ? "bg-[#9333ea]" : "bg-[#e5e5e5]"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isZenMode ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer CTA */}
          <div className="pt-2">
            <button
              disabled={isTooSmall}
              onClick={handleStart}
              type="button"
              className={`w-full py-3 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                isTooSmall
                  ? "bg-[#fafafa] text-[#a3a3a3] cursor-not-allowed border border-[#e5e5e5]"
                  : "bg-[#000000] text-white hover:bg-[#171717] active:scale-98"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              Start Practice Quiz
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
