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
  HelpCircle,
  PenTool,
  BookOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["practice", "common"]);
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

  const practiceModes: Array<{
    id: PracticeMode;
    title: string;
    sub: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: "multiple-choice",
      title: t("setup.modes.multipleChoice", "Trắc nghiệm"),
      sub: t("setup.modes.multipleChoiceSub", "4 lựa chọn"),
      icon: HelpCircle,
    },
    {
      id: "fill-in-the-blank",
      title: t("setup.modes.fillInBlank", "Điền từ"),
      sub: t("setup.modes.fillInBlankSub", "Gõ từ đúng"),
      icon: PenTool,
    },
    {
      id: "listening",
      title: t("setup.modes.listening", "Luyện nghe"),
      sub: t("setup.modes.listeningSub", "Nghe & gõ"),
      icon: Headphones,
    },
    {
      id: "matching",
      title: t("setup.modes.matching", "Nối từ"),
      sub: t("setup.modes.matchingSub", "Ghép cặp thẻ"),
      icon: Layers,
    },
    {
      id: "pronunciation",
      title: t("setup.modes.pronunciation", "Phát âm"),
      sub: t("setup.modes.pronunciationSub", "Chấm điểm AI"),
      icon: Mic,
    },
  ];

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
          className="relative w-full max-w-xl bg-white border border-[#e5e5e5] rounded-3xl p-6 sm:p-7 shadow-xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#f3e8ff] border border-[#e9d5ff] flex items-center justify-center text-[#7e22ce]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2
                  id="quiz-setup-title"
                  className="text-lg font-bold text-black tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t("setup.title", "Luyện tập & Trắc nghiệm")}
                </h2>
                <p className="text-xs text-[#737373]">
                  {t(
                    "setup.subtitle",
                    "Chọn chế độ ôn tập và cấu hình phiên học",
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-full text-[#737373] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-5 space-y-5">
            {/* Practice Mode Selector */}
            <div>
              <span className="text-[11px] font-mono text-[#737373] uppercase tracking-wider font-semibold block mb-2.5">
                {t("setup.modeLabel", "Chế độ ôn luyện")}
              </span>
              <div className="grid grid-cols-5 gap-2">
                {practiceModes.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedMode === mode.id;

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSelectedMode(mode.id)}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[90px] ${
                        isSelected
                          ? "bg-black text-white border-black shadow-xs ring-2 ring-black ring-offset-1"
                          : "bg-[#fafafa] text-black border-[#e5e5e5] hover:border-black hover:bg-white"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center mb-1.5 ${
                          isSelected
                            ? "bg-white/15 text-[#ffbd2e]"
                            : "bg-white text-[#737373] border border-[#e5e5e5]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <span className="text-xs font-bold leading-tight block mb-1">
                        {mode.title}
                      </span>

                      <span
                        className={`text-[10px] font-mono leading-none ${
                          isSelected ? "text-white/75" : "text-[#737373]"
                        }`}
                      >
                        {mode.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deck info pill */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#f3e8ff] border border-[#e9d5ff] flex items-center justify-center text-[#7e22ce] shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block leading-none mb-1">
                    {t("setup.deckLabel", "Bộ từ đang chọn")}
                  </span>
                  <p className="text-xs font-bold text-black truncate">
                    {deckTitle}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-white border border-[#e5e5e5] text-black shrink-0">
                {t("setup.allCardsCount", {
                  count: totalCards,
                  defaultValue: `${totalCards} thẻ`,
                })}
              </span>
            </div>

            {/* Warning if deck has insufficient cards */}
            {isTooSmall ? (
              <div className="p-4 bg-[#fef2f2] border border-[#ef4444]/30 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
                <div className="text-xs text-[#991b1b] leading-relaxed">
                  <span className="font-semibold block text-sm mb-0.5">
                    {t("setup.notEnoughCards", "Chưa đủ số lượng thẻ")}
                  </span>
                  {selectedMode === "multiple-choice"
                    ? t("setup.minCardsMultipleChoice", {
                        count: totalCards,
                        defaultValue: `Bộ thẻ chỉ có ${totalCards} thẻ. Trắc nghiệm cần tối thiểu 4 thẻ từ vựng.`,
                      })
                    : selectedMode === "matching"
                      ? t("setup.minCardsMatching", {
                          count: totalCards,
                          defaultValue: `Bộ thẻ chỉ có ${totalCards} thẻ. Trò chơi nối từ cần tối thiểu 5 thẻ từ vựng.`,
                        })
                      : t(
                          "setup.noCards",
                          "Bộ thẻ chưa có thẻ nào. Vui lòng thêm từ vựng để bắt đầu luyện tập.",
                        )}
                </div>
              </div>
            ) : (
              <>
                {/* Question Count Presets */}
                <div>
                  <span className="text-[11px] font-mono text-[#737373] uppercase tracking-wider font-semibold block mb-2">
                    {t("setup.questionCount", "Số lượng câu hỏi")}
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      {
                        label:
                          selectedMode === "matching"
                            ? t("setup.matchingCards", {
                                count: 5,
                                round: 1,
                                defaultValue: "5 Thẻ (1 Vòng)",
                              })
                            : t("setup.cardsCount", {
                                count: 10,
                                defaultValue: "10 Thẻ",
                              }),
                        count: selectedMode === "matching" ? 5 : 10,
                        sub:
                          selectedMode === "matching"
                            ? t("setup.rounds", {
                                count: 1,
                                defaultValue: "1 Vòng",
                              })
                            : t("setup.approxMin", {
                                min: 2,
                                defaultValue: "~2 phút",
                              }),
                      },
                      {
                        label:
                          selectedMode === "matching"
                            ? t("setup.matchingCards", {
                                count: 10,
                                round: 2,
                                defaultValue: "10 Thẻ (2 Vòng)",
                              })
                            : t("setup.cardsCount", {
                                count: 20,
                                defaultValue: "20 Thẻ",
                              }),
                        count: selectedMode === "matching" ? 10 : 20,
                        sub:
                          selectedMode === "matching"
                            ? t("setup.rounds", {
                                count: 2,
                                defaultValue: "2 Vòng",
                              })
                            : t("setup.approxMin", {
                                min: 5,
                                defaultValue: "~5 phút",
                              }),
                      },
                      {
                        label: t("setup.allCards", "Tất cả thẻ"),
                        count: totalCards,
                        sub: t("setup.allCardsCount", {
                          count: totalCards,
                          defaultValue: `${totalCards} thẻ`,
                        }),
                      },
                    ].map((preset) => {
                      const isSelected = selectedLimit === preset.count;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setSelectedLimit(preset.count)}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-black text-white border-black shadow-xs ring-2 ring-black ring-offset-1"
                              : "bg-[#fafafa] text-black border-[#e5e5e5] hover:border-black hover:bg-white"
                          }`}
                        >
                          <span className="block text-xs font-bold leading-tight">
                            {preset.label}
                          </span>
                          <span
                            className={`block text-[11px] font-mono mt-1 ${
                              isSelected ? "text-white/75" : "text-[#737373]"
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
                <div className="p-3.5 bg-[#fafafa] border border-[#e5e5e5] rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#e5e5e5] flex items-center justify-center text-[#737373] shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-black block leading-snug">
                        {t("setup.zenMode", "Chế độ Thư giãn (Zen Mode)")}
                      </span>
                      <span className="text-[11px] text-[#737373] leading-none">
                        {t(
                          "setup.zenModeDesc",
                          "Tắt đếm ngược 15s để luyện tập thoải mái, không áp lực",
                        )}
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
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
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
              className={`w-full h-11 rounded-full font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                isTooSmall
                  ? "bg-[#fafafa] text-[#a3a3a3] cursor-not-allowed border border-[#e5e5e5]"
                  : "btn-primary focus-visible:ring-2 focus-visible:ring-black"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t("setup.startBtn", "Bắt đầu Luyện tập")}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
