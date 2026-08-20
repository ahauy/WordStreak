import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { QuizOptionDto } from "@wordstreak/shared-types";
import type { FeedbackState } from "../hooks/useQuizEngine";

interface QuizOptionButtonProps {
  option: QuizOptionDto;
  index: number;
  hotkey: string;
  isSelected: boolean;
  feedbackState: FeedbackState;
  disabled: boolean;
  onClick: () => void;
}

export const QuizOptionButton: React.FC<QuizOptionButtonProps> = ({
  option,
  hotkey,
  isSelected,
  feedbackState,
  disabled,
  onClick,
}) => {
  const isAnswered = feedbackState !== "IDLE";
  const isCorrect = option.isCorrect;

  // Determine visual styling state
  let cardBg = "bg-white hover:bg-[#fafafa]";
  let borderStyle = "border-[#e5e5e5] hover:border-[#d4d4d4]";
  let textColor = "text-[#000000]";
  let hotkeyBg = "bg-[#fafafa] text-[#737373] border-[#e5e5e5]";
  let iconIndicator: React.ReactNode = null;

  if (isAnswered) {
    if (isCorrect) {
      // Highlight correct option in green
      cardBg = "bg-[#f0fdf4]";
      borderStyle = "border-[#10b981]";
      textColor = "text-[#166534] font-semibold";
      hotkeyBg = "bg-[#059669] text-white border-transparent";
      iconIndicator = <Check className="w-4 h-4 text-[#059669]" />;
    } else if (isSelected) {
      // Selected wrong option in red
      cardBg = "bg-[#fef2f2]";
      borderStyle = "border-[#ef4444]";
      textColor = "text-[#991b1b] font-semibold";
      hotkeyBg = "bg-[#dc2626] text-white border-transparent";
      iconIndicator = <X className="w-4 h-4 text-[#dc2626]" />;
    } else {
      // Unselected other wrong options
      cardBg = "bg-white opacity-40";
      borderStyle = "border-[#e5e5e5]";
      textColor = "text-[#737373]";
    }
  }

  return (
    <div className="w-full">
      <motion.button
        type="button"
        disabled={disabled}
        onClick={onClick}
        whileHover={!disabled ? { y: -2 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`w-full min-h-[56px] px-4 py-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors duration-150 ${cardBg} ${borderStyle}`}
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          {/* Hotkey Badge */}
          <span
            className={`w-7 h-7 shrink-0 rounded-lg border text-xs font-mono font-bold flex items-center justify-center transition-colors ${hotkeyBg}`}
          >
            {hotkey}
          </span>

          {/* Option Text */}
          <span
            className={`text-sm sm:text-base font-sans leading-snug break-words ${textColor}`}
          >
            {option.text}
          </span>
        </div>

        {/* Status Icon Indicator */}
        {iconIndicator && <div className="shrink-0 pl-2">{iconIndicator}</div>}
      </motion.button>
    </div>
  );
};
