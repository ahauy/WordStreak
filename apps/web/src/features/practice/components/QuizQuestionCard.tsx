import React, { useState } from "react";
import { Volume2, Sparkles } from "lucide-react";
import type { QuizQuestionDto } from "@wordstreak/shared-types";

interface QuizQuestionCardProps {
  question: QuizQuestionDto;
}

export const QuizQuestionCard: React.FC<QuizQuestionCardProps> = ({
  question,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const playAudio = () => {
    if (!question.audioUrl || isPlayingAudio) return;
    try {
      setIsPlayingAudio(true);
      const audio = new Audio(question.audioUrl);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      audio.play().catch(() => setIsPlayingAudio(false));
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const isEnToVi = question.format === "EN_TO_VI";

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-[#e5e5e5] rounded-2xl p-6 sm:p-8 text-center shadow-sm">
      {/* Category / Direction Chip */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fafafa] border border-[#e5e5e5] text-xs font-mono text-[#737373] mb-5">
        <Sparkles className="w-3 h-3 text-[#9333ea]" />
        <span>
          {isEnToVi ? "English → Vietnamese" : "Vietnamese → English"}
        </span>
      </div>

      {/* Main Prompt Word / Meaning */}
      <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#000000] tracking-tight mb-2">
        {question.prompt}
      </h2>

      {/* Phonetic & Audio (if EN_TO_VI) */}
      {isEnToVi && (
        <div className="flex items-center justify-center gap-2 mt-2">
          {question.phonetic && (
            <span className="font-mono text-sm text-[#737373]">
              {question.phonetic}
            </span>
          )}
          {question.audioUrl && (
            <button
              onClick={playAudio}
              type="button"
              aria-label="Play pronunciation audio"
              className="p-1.5 rounded-full text-[#737373] hover:text-[#000000] hover:bg-[#fafafa] transition-colors border border-transparent hover:border-[#e5e5e5]"
            >
              <Volume2
                className={`w-4 h-4 ${isPlayingAudio ? "text-[#9333ea] animate-pulse" : ""}`}
              />
            </button>
          )}
        </div>
      )}

      {/* Sentence Context with Blank (if VI_TO_EN) */}
      {!isEnToVi && question.exampleContext && (
        <p className="text-sm font-sans text-[#737373] italic mt-3 px-4 py-2 bg-[#fafafa] border border-[#e5e5e5] rounded-xl">
          "{question.exampleContext}"
        </p>
      )}
    </div>
  );
};
