import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  RotateCcw,
  ArrowLeft,
  Volume2,
  CheckCircle2,
} from "lucide-react";
import type { QuizResultResponseDto } from "@wordstreak/shared-types";

interface QuizResultsViewProps {
  result: QuizResultResponseDto;
  onRetake: () => void;
  onBackToDeck: () => void;
}

export const QuizResultsView: React.FC<QuizResultsViewProps> = ({
  result,
  onRetake,
  onBackToDeck,
}) => {
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);

  const playWordAudio = (url?: string | null) => {
    if (!url) return;
    setPlayingAudioUrl(url);
    const audio = new Audio(url);
    audio.onended = () => setPlayingAudioUrl(null);
    audio.onerror = () => setPlayingAudioUrl(null);
    audio.play().catch(() => setPlayingAudioUrl(null));
  };

  const isPerfect = result.accuracyPercentage === 100;
  const isGood = result.accuracyPercentage >= 70;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-xl mx-auto px-4 py-8"
    >
      <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 sm:p-8 text-center shadow-sm">
        {/* Celebration Trophy / Badge */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center text-[#9333ea]">
          {isPerfect ? (
            <Trophy className="w-8 h-8 text-[#9333ea]" />
          ) : (
            <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#000000] tracking-tight mb-1">
          {isPerfect
            ? "Flawless Victory!"
            : isGood
              ? "Great Practice Session!"
              : "Practice Complete!"}
        </h1>
        <p className="text-sm font-sans text-[#737373] mb-6">
          {isPerfect
            ? "You scored 100% accuracy with zero mistakes."
            : `You mastered ${result.correctCount} out of ${result.totalQuestions} questions.`}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {/* Accuracy */}
          <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-2xl p-3.5">
            <span className="block text-xs font-mono text-[#737373] mb-1">
              Accuracy
            </span>
            <span className="text-xl sm:text-2xl font-bold font-display text-[#000000]">
              {result.accuracyPercentage}%
            </span>
          </div>

          {/* XP Earned */}
          <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-2xl p-3.5">
            <span className="block text-xs font-mono text-[#737373] mb-1">
              XP Earned
            </span>
            <span className="text-xl sm:text-2xl font-bold font-display text-[#9333ea]">
              +{result.totalXpEarned}
            </span>
          </div>

          {/* Highest Combo */}
          <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-2xl p-3.5">
            <span className="block text-xs font-mono text-[#737373] mb-1 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-[#9333ea]" />
              Combo
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#000000]">
              {result.maxCombo}x
            </span>
          </div>
        </div>

        {/* Missed Words Section */}
        {result.missedCards && result.missedCards.length > 0 && (
          <div className="text-left mb-8">
            <h3 className="text-xs font-mono font-bold text-[#737373] uppercase tracking-wider mb-3">
              Words to Review ({result.missedCards.length})
            </h3>
            <div className="divide-y divide-[#e5e5e5] border border-[#e5e5e5] rounded-2xl overflow-hidden">
              {result.missedCards.map((card) => (
                <div
                  key={card.cardId}
                  className="p-3.5 bg-white flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#000000]">
                        {card.word}
                      </span>
                      {card.phonetic && (
                        <span className="text-xs font-mono text-[#737373]">
                          {card.phonetic}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#737373] truncate mt-0.5">
                      {card.meaning}
                    </p>
                  </div>

                  {card.audioUrl && (
                    <button
                      onClick={() => playWordAudio(card.audioUrl)}
                      type="button"
                      aria-label="Listen pronunciation"
                      className="p-1.5 rounded-full text-[#737373] hover:text-[#000000] hover:bg-[#fafafa] transition-colors"
                    >
                      <Volume2
                        className={`w-4 h-4 ${
                          playingAudioUrl === card.audioUrl
                            ? "text-[#9333ea] animate-pulse"
                            : ""
                        }`}
                      />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onRetake}
            type="button"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#000000] text-white font-medium text-sm hover:bg-[#171717] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </button>
          <button
            onClick={onBackToDeck}
            type="button"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white border border-[#e5e5e5] text-[#000000] font-medium text-sm hover:bg-[#fafafa] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Deck
          </button>
        </div>
      </div>
    </motion.div>
  );
};
