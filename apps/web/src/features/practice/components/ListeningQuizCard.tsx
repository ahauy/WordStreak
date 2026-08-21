import React from "react";
import { motion } from "framer-motion";
import { Volume2, RotateCcw, Play, Zap } from "lucide-react";
import type { ListeningQuestionDto, DiffSpan } from "@wordstreak/shared-types";
import { ListeningTypingInput } from "./ListeningTypingInput";
import { ProgressiveHintBox } from "./ProgressiveHintBox";

export interface ListeningQuizCardProps {
  question: ListeningQuestionDto;
  typedInput: string;
  feedbackState: "IDLE" | "CORRECT" | "INCORRECT";
  hintLevel: number;
  replayCount: number;
  playbackSpeed: number;
  isPlayingAudio: boolean;
  needsUserGesture: boolean;
  characterDiff: DiffSpan[] | null;
  onInputChange: (val: string) => void;
  onSubmit: () => void;
  onReplayAudio: () => void;
  onToggleSpeed: () => void;
  onTriggerHint: () => void;
  onUnlockAudio: () => void;
}

export const ListeningQuizCard: React.FC<ListeningQuizCardProps> = ({
  question,
  typedInput,
  feedbackState,
  hintLevel,
  replayCount,
  playbackSpeed,
  isPlayingAudio,
  needsUserGesture,
  characterDiff,
  onInputChange,
  onSubmit,
  onReplayAudio,
  onToggleSpeed,
  onTriggerHint,
  onUnlockAudio,
}) => {
  return (
    // Stable outer hover anchor to eliminate 60Hz flicker (from MEMORY.md)
    <div className="w-full max-w-xl mx-auto pt-4 -mt-4 pb-4 -mb-4">
      <div className="bg-white border border-[#e5e5e5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Top Audio Player Centerpiece */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          {/* Waveform / Speaker Pulse Circle */}
          <div
            data-testid="audio-waveform-speaker"
            className="relative flex items-center justify-center"
          >
            {/* Ambient Violet Waveform Glow */}
            {isPlayingAudio && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0.3 }}
                animate={{ scale: 1.25, opacity: 0.6 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 0.8,
                  ease: "easeInOut",
                }}
                className="absolute w-24 h-24 rounded-full bg-[#f3e8ff]"
              />
            )}

            <button
              type="button"
              onClick={needsUserGesture ? onUnlockAudio : onReplayAudio}
              aria-label={
                needsUserGesture ? "Kích hoạt phát âm" : "Phát âm thanh"
              }
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${
                needsUserGesture
                  ? "bg-[#9333ea] text-white animate-bounce"
                  : isPlayingAudio
                    ? "bg-[#9333ea] text-white shadow-[#9333ea]/30"
                    : "bg-[#000000] text-white hover:bg-[#171717]"
              }`}
            >
              {needsUserGesture ? (
                <Play className="w-8 h-8 fill-current ml-0.5" />
              ) : (
                <Volume2
                  className={`w-8 h-8 ${isPlayingAudio ? "animate-pulse" : ""}`}
                />
              )}
            </button>
          </div>

          {/* Autoplay Unlock Notice or Audio Controls */}
          {needsUserGesture ? (
            <button
              type="button"
              onClick={onUnlockAudio}
              className="px-5 py-2 rounded-full bg-[#9333ea] text-white text-xs font-semibold hover:bg-[#7e22ce] transition-all shadow-sm flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Bấm để nghe (Click to Listen - Space)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              {/* Replay Button */}
              <button
                type="button"
                onClick={onReplayAudio}
                aria-label="Nghe lại"
                className="px-4 py-2 rounded-full bg-[#fafafa] border border-[#e5e5e5] text-[#000000] hover:bg-[#f5f5f5] text-xs font-medium transition-all flex items-center gap-1.5 shadow-2xs active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#737373]" />
                <span>Nghe lại (Space)</span>
              </button>

              {/* Speed Toggle Pill */}
              <button
                type="button"
                onClick={onToggleSpeed}
                className={`px-3.5 py-2 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 border ${
                  playbackSpeed === 0.75
                    ? "bg-[#9333ea] text-white border-[#9333ea]"
                    : "bg-[#fafafa] text-[#000000] border-[#e5e5e5] hover:bg-[#f5f5f5]"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{playbackSpeed === 0.75 ? "0.75x Chậm" : "1.0x"}</span>
              </button>

              {/* Replay Counter Badge if replayed */}
              {replayCount > 0 && (
                <span className="text-[11px] font-mono text-[#a3a3a3] px-2 py-1 bg-[#fafafa] rounded-full border border-[#e5e5e5]">
                  {replayCount}x
                </span>
              )}
            </div>
          )}
        </div>

        {/* Typing Input */}
        <ListeningTypingInput
          value={typedInput}
          wordLength={question.wordLength}
          feedbackState={feedbackState}
          characterDiff={characterDiff}
          onChange={onInputChange}
          onSubmit={onSubmit}
        />

        {/* Progressive Hint Box */}
        <ProgressiveHintBox
          hintLevel={hintLevel}
          word={question.word}
          meaning={question.meaning}
          phonetic={question.phonetic}
          wordLength={question.wordLength}
          onTriggerHint={onTriggerHint}
          disabled={feedbackState !== "IDLE"}
        />
      </div>
    </div>
  );
};
