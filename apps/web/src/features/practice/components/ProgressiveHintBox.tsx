import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Sparkles, BookOpen, Volume2 } from "lucide-react";

export interface ProgressiveHintBoxProps {
  hintLevel: number; // 0, 1, 2, 3
  word: string;
  meaning: string;
  phonetic?: string | null;
  wordLength: number;
  onTriggerHint: () => void;
  disabled?: boolean;
}

export const ProgressiveHintBox: React.FC<ProgressiveHintBoxProps> = ({
  hintLevel,
  word,
  meaning,
  phonetic,
  wordLength,
  onTriggerHint,
  disabled = false,
}) => {
  const isMaxHints = hintLevel >= 3;

  // Build Tier 1 slot representation: "P _ _ _ _ _ _ _ _ _ _ _"
  const firstChar = word.charAt(0).toUpperCase();
  const slotCount = Math.max(0, wordLength - 1);
  const slotsString = `${firstChar} ${Array(slotCount).fill("_").join(" ")}`;

  return (
    <div className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-2xl p-4 transition-all">
      {/* Header & Trigger Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#9333ea]" />
          <span className="text-xs font-mono font-medium text-[#737373] uppercase tracking-wider">
            Gợi ý tiến trình (Tier {hintLevel}/3)
          </span>
        </div>

        <button
          type="button"
          onClick={onTriggerHint}
          disabled={disabled || isMaxHints}
          aria-label="Gợi ý (Hint)"
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm ${
            isMaxHints || disabled
              ? "bg-[#e5e5e5] text-[#a3a3a3] cursor-not-allowed"
              : "bg-[#000000] text-white hover:bg-[#171717] active:scale-95"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#c084fc]" />
          <span>
            {isMaxHints
              ? "Hết gợi ý"
              : hintLevel === 0
                ? "Gợi ý (Ctrl+H)"
                : `Thêm gợi ý (${hintLevel + 1}/3)`}
          </span>
        </button>
      </div>

      {/* Progressive Disclosures */}
      <AnimatePresence mode="sync">
        {hintLevel > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-3 pt-3 border-t border-[#e5e5e5] space-y-2.5"
          >
            {/* Tier 1: Length & First Letter */}
            {hintLevel >= 1 && (
              <div className="flex items-center justify-between text-xs bg-white border border-[#e5e5e5] rounded-xl px-3 py-2">
                <span className="font-medium text-[#737373]">
                  Tier 1: Độ dài & Ký tự đầu
                </span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-[#f5f3ff] text-[#9333ea] font-semibold">
                    {wordLength} chữ cái
                  </span>
                  <span className="font-bold tracking-widest text-[#000000]">
                    {slotsString}
                  </span>
                </div>
              </div>
            )}

            {/* Tier 2: Meaning */}
            {hintLevel >= 2 && (
              <div className="flex items-start justify-between text-xs bg-white border border-[#e5e5e5] rounded-xl px-3 py-2">
                <div className="flex items-center gap-1.5 font-medium text-[#737373]">
                  <BookOpen className="w-3.5 h-3.5 text-[#9333ea]" />
                  <span>Tier 2: Nghĩa từ</span>
                </div>
                <span className="font-sans font-medium text-[#000000] text-right">
                  {meaning}
                </span>
              </div>
            )}

            {/* Tier 3: Phonetic IPA */}
            {hintLevel >= 3 && phonetic && (
              <div className="flex items-center justify-between text-xs bg-white border border-[#e5e5e5] rounded-xl px-3 py-2">
                <div className="flex items-center gap-1.5 font-medium text-[#737373]">
                  <Volume2 className="w-3.5 h-3.5 text-[#9333ea]" />
                  <span>Tier 3: Phiên âm</span>
                </div>
                <span className="font-mono text-[#9333ea] font-bold">
                  {phonetic}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed Bonus Notice */}
      {hintLevel === 0 && (
        <p className="text-[11px] font-sans text-[#a3a3a3] mt-2">
          Dùng gợi ý sẽ không nhận được thưởng tốc độ (+15 XP).
        </p>
      )}
    </div>
  );
};
