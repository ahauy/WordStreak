import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import type { FillBlankQuestionDto } from "@wordstreak/shared-types";
import type { FillBlankFeedbackState } from "../hooks/useFillBlankQuiz";

interface FillBlankInputProps {
  question: FillBlankQuestionDto;
  typedInput: string;
  feedbackState: FillBlankFeedbackState;
  hintLevel: number;
  isAnagramMode: boolean;
  onInputChange: (val: string) => void;
  onSubmit: () => void;
  onTriggerHint: () => void;
  onToggleAnagram: () => void;
}

export const FillBlankInput: React.FC<FillBlankInputProps> = ({
  question,
  typedInput,
  feedbackState,
  hintLevel,
  isAnagramMode,
  onInputChange,
  onSubmit,
  onTriggerHint,
  onToggleAnagram,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const targetWord = question.targetInflection || question.targetWord;
  const isCorrect = feedbackState === "CORRECT";
  const isIncorrect =
    feedbackState === "INCORRECT" || feedbackState === "TIMEOUT";
  const isLocked = feedbackState !== "IDLE";

  // Auto focus input when idle and not in anagram mode
  useEffect(() => {
    if (!isLocked && !isAnagramMode) {
      inputRef.current?.focus();
    }
  }, [question.id, isLocked, isAnagramMode]);

  const handlePlayAudio = () => {
    if (question.audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(question.audioUrl);
      } else {
        audioRef.current.src = question.audioUrl;
      }
      audioRef.current.play().catch(() => null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Target Word Info Header (Meaning & IPA audio) */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[#e5e5e5] bg-white shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[#fafafa] border border-[#e5e5e5] text-[#737373]">
            Target Meaning
          </span>
          <div className="flex items-center gap-2">
            {question.audioUrl && (
              <button
                type="button"
                onClick={handlePlayAudio}
                className="w-8 h-8 rounded-full border border-[#e5e5e5] flex items-center justify-center text-[#737373] hover:text-[#000000] hover:border-[#000000] transition-colors"
                title="Play Audio"
                aria-label="Play pronunciation audio"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              disabled={isLocked || hintLevel >= 2}
              onClick={onTriggerHint}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                hintLevel > 0
                  ? "bg-[#faf5ff] text-[#9333ea] border-[#d8b4fe]"
                  : "bg-white text-[#737373] border-[#e5e5e5] hover:text-[#000000] hover:border-[#a3a3a3]"
              }`}
              title="Get Hint (Ctrl+H)"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              {hintLevel === 0
                ? "Hint"
                : hintLevel === 1
                  ? "IPA Hint"
                  : "Hint Used"}
            </button>
          </div>
        </div>

        {/* Vietnamese Meaning Prompt */}
        <h3 className="text-xl sm:text-2xl font-bold font-display text-[#000000] tracking-tight">
          {question.meaning}
        </h3>

        {/* IPA Display if hint triggered */}
        {hintLevel >= 1 && question.phonetic && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-sm font-mono text-[#9333ea] flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            IPA: {question.phonetic}
          </motion.div>
        )}

        {/* Masked Sentence Context */}
        <div className="pt-3 border-t border-[#f5f5f5] text-base sm:text-lg text-[#171717] leading-relaxed">
          {question.sentencePrefix && <span>{question.sentencePrefix}</span>}
          <span className="inline-block px-3 py-0.5 mx-1 font-mono font-bold text-[#000000] bg-[#f5f5f5] rounded-md border border-[#e5e5e5]">
            {isLocked ? (
              <span className={isCorrect ? "text-[#10b981]" : "text-[#ef4444]"}>
                {typedInput || "_____"}
              </span>
            ) : (
              typedInput || "_____"
            )}
          </span>
          {question.sentenceSuffix && <span>{question.sentenceSuffix}</span>}
        </div>
      </div>

      {/* Interactive Input Box & Controls */}
      <div className="flex flex-col gap-3">
        <div className="relative flex items-center w-full">
          <input
            ref={inputRef}
            type="text"
            disabled={isLocked || isAnagramMode}
            value={typedInput}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={
              isAnagramMode
                ? "Tap letter tiles below..."
                : `Type word (${targetWord.length} letters)...`
            }
            className={`w-full px-5 py-4 text-lg font-mono rounded-2xl border transition-all outline-none ${
              isCorrect
                ? "border-[#10b981] bg-[#ecfdf5] text-[#065f46]"
                : isIncorrect
                  ? "border-[#ef4444] bg-[#fef2f2] text-[#991b1b]"
                  : "border-[#e5e5e5] bg-white text-[#000000] focus:border-[#000000] focus:ring-1 focus:ring-[#000000]"
            } ${isAnagramMode ? "cursor-default" : ""}`}
            aria-label="Vocabulary spelling input"
          />

          {/* Feedback Icon or Submit Button */}
          <div className="absolute right-4 flex items-center gap-2">
            {isCorrect && (
              <CheckCircle2 className="w-6 h-6 text-[#10b981] animate-in zoom-in" />
            )}
            {isIncorrect && (
              <XCircle className="w-6 h-6 text-[#ef4444] animate-in zoom-in" />
            )}
            {!isLocked && !isAnagramMode && (
              <button
                type="button"
                disabled={typedInput.trim().length === 0}
                onClick={onSubmit}
                className="px-4 py-1.5 rounded-full bg-[#000000] text-white text-xs font-semibold hover:bg-[#171717] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Submit
              </button>
            )}
          </div>
        </div>

        {/* Incorrect Answer Reveal */}
        {isIncorrect && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-[#fef2f2] border border-[#ef4444]/20 flex items-center justify-between text-sm"
          >
            <span className="text-[#991b1b]">Correct spelling:</span>
            <span className="font-mono font-bold text-[#10b981] text-base">
              {targetWord}
            </span>
          </motion.div>
        )}

        {/* Input Mode Switcher (Typing vs Anagram Tiles) */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono text-[#a3a3a3]">
            Length: {targetWord.length} chars
          </span>

          <button
            type="button"
            disabled={isLocked}
            onClick={onToggleAnagram}
            className="text-xs font-mono text-[#737373] hover:text-[#000000] underline underline-offset-4 transition-colors cursor-pointer"
          >
            {isAnagramMode
              ? "Switch to Direct Typing"
              : "Switch to Letter Tiles (Anagram)"}
          </button>
        </div>
      </div>
    </div>
  );
};
