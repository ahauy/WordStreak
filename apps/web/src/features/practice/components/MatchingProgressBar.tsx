import React from "react";
import { ArrowLeft, Clock, Flame, Volume2, VolumeX } from "lucide-react";

export interface MatchingProgressBarProps {
  currentRoundIndex: number;
  totalRounds: number;
  matchedPairsCount?: number;
  totalPairsCount?: number;
  roundMatchedCount: number;
  roundTotalCount: number;
  timerSeconds: number;
  isZenMode: boolean;
  currentCombo: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onExit: () => void;
  deckTitle?: string;
}

export const MatchingProgressBar: React.FC<MatchingProgressBarProps> = ({
  currentRoundIndex,
  totalRounds,
  roundMatchedCount,
  roundTotalCount = 5,
  timerSeconds,
  isZenMode,
  currentCombo,
  isMuted,
  onToggleMute,
  onExit,
  deckTitle,
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const isLowTime = !isZenMode && timerSeconds <= 10 && timerSeconds > 0;
  const progressPercent =
    roundTotalCount > 0 ? (roundMatchedCount / roundTotalCount) * 100 : 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-[#e5e5e5]">
      {/* Hairline round progress bar at the very top */}
      <div className="w-full h-1 bg-[#fafafa]">
        <div
          className="h-full bg-[#000000] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Exit button & Deck Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onExit}
            aria-label="Thoát ôn tập"
            className="p-1.5 -ml-1.5 rounded-full text-[#737373] hover:text-[#000000] hover:bg-[#fafafa] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9333ea]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {deckTitle && (
            <div className="hidden sm:block min-w-0">
              <span className="block text-xs font-mono text-[#a3a3a3] uppercase tracking-wider">
                Nối từ vựng
              </span>
              <h1 className="text-sm font-semibold text-[#000000] truncate max-w-[200px]">
                {deckTitle}
              </h1>
            </div>
          )}
        </div>

        {/* Center: Round Badge & Combo Streak Flame */}
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1 rounded-full border border-[#e5e5e5] bg-[#fafafa] text-xs font-mono font-medium text-[#000000]">
            Vòng {currentRoundIndex + 1}/{totalRounds}
          </div>

          {currentCombo >= 2 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#9333ea]/30 bg-[#9333ea]/10 text-xs font-mono font-bold text-[#9333ea] animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-[#9333ea]" />
              <span>{currentCombo}x Combo</span>
            </div>
          )}
        </div>

        {/* Right: Timer & Mute Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Timer Display */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-semibold transition-colors ${
              isLowTime
                ? "border-[#ef4444] bg-[#fef2f2] text-[#ef4444] animate-pulse"
                : "border-[#e5e5e5] bg-[#fafafa] text-[#000000]"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#737373]" />
            <span>{formatTime(timerSeconds)}</span>
            {isZenMode && (
              <span className="text-[10px] text-[#a3a3a3] font-normal">
                (Zen)
              </span>
            )}
          </div>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            className="p-2 rounded-full border border-[#e5e5e5] bg-[#fafafa] text-[#737373] hover:text-[#000000] hover:border-[#000000] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9333ea]"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[#ef4444]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#000000]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
