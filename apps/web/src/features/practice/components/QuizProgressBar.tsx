import React from "react";
import { motion } from "framer-motion";
import { X, Flame, Zap } from "lucide-react";

interface QuizProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
  timerSeconds: number;
  isZenMode: boolean;
  currentCombo: number;
  deckTitle?: string;
  onExit: () => void;
}

export const QuizProgressBar: React.FC<QuizProgressBarProps> = ({
  currentIndex,
  totalQuestions,
  timerSeconds,
  isZenMode,
  currentCombo,
  deckTitle,
  onExit,
}) => {
  const progressPercent =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const timerPercent = isZenMode ? 100 : (timerSeconds / 15) * 100;
  const isUrgent = !isZenMode && timerSeconds <= 5;

  return (
    <div className="w-full bg-white border-b border-[#e5e5e5] px-4 py-3 sm:px-6">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        {/* Exit Button */}
        <button
          onClick={onExit}
          type="button"
          aria-label="Exit Quiz"
          className="p-2 rounded-full text-[#737373] hover:text-[#000000] hover:bg-[#fafafa] transition-colors border border-transparent hover:border-[#e5e5e5]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Center Progress & Timer */}
        <div className="flex-1 max-w-md flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-[#737373]">
            <span className="truncate max-w-[200px]">
              {deckTitle ? `${deckTitle} • ` : ""}Question{" "}
              <span className="font-semibold text-[#000000]">
                {currentIndex + 1}
              </span>{" "}
              of {totalQuestions}
            </span>
            {!isZenMode && (
              <span
                className={`font-semibold flex items-center gap-1 ${isUrgent ? "text-[#ef4444] animate-pulse" : "text-[#737373]"}`}
              >
                <Zap className="w-3.5 h-3.5" />
                {timerSeconds}s
              </span>
            )}
            {isZenMode && (
              <span className="text-[#a3a3a3] font-sans text-xs">Zen Mode</span>
            )}
          </div>

          {/* Progress Bars */}
          <div className="w-full h-1.5 bg-[#fafafa] border border-[#e5e5e5] rounded-full overflow-hidden flex">
            <motion.div
              className="h-full bg-[#000000]"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          {!isZenMode && (
            <div className="w-full h-1 bg-[#fafafa] rounded-full overflow-hidden">
              <motion.div
                className={`h-full transition-colors ${
                  isUrgent ? "bg-[#ef4444]" : "bg-[#9333ea]"
                }`}
                initial={false}
                animate={{ width: `${timerPercent}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
          )}
        </div>

        {/* Combo Badge */}
        <div className="flex items-center min-w-[72px] justify-end">
          {currentCombo >= 2 ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={currentCombo}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fafafa] border border-[#9333ea]/30 text-[#9333ea] text-xs font-mono font-bold shadow-sm"
            >
              <Flame className="w-3.5 h-3.5 text-[#9333ea] fill-[#9333ea]" />
              <span>{currentCombo}x</span>
            </motion.div>
          ) : (
            <div className="w-16" />
          )}
        </div>
      </div>
    </div>
  );
};
