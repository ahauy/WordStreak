import React from "react";
import { Volume2 } from "lucide-react";
import type {
  MatchingCardItemDto,
  MatchingTileState,
} from "@wordstreak/shared-types";

export interface MatchingTileProps {
  tile: MatchingCardItemDto;
  state: MatchingTileState;
  hotkeyLabel: string;
  onSelect: (tileId: string) => void;
  onPlayAudio?: (audioUrl: string) => void;
  disabled?: boolean;
}

export const MatchingTile: React.FC<MatchingTileProps> = ({
  tile,
  state = "NEUTRAL",
  hotkeyLabel,
  onSelect,
  onPlayAudio,
  disabled = false,
}) => {
  const isMatched = state === "MATCHED" || state === "matched";
  const isSelected = state === "SELECTED" || state === "selected";
  const isMismatch = state === "MISMATCH" || state === "error";
  const isInteractive = !isMatched && !disabled;

  const handleTileClick = () => {
    if (!isInteractive) return;
    onSelect(tile.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && isInteractive) {
      e.preventDefault();
      onSelect(tile.id);
    }
  };

  const handleSpeakerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tile.audioUrl && onPlayAudio && isInteractive) {
      onPlayAudio(tile.audioUrl);
    }
  };

  // State-specific styling tokens
  let stateClasses =
    "border-[#e5e5e5] bg-white text-[#000000] hover:border-[#000000] hover:shadow-sm cursor-pointer";

  if (isMatched) {
    stateClasses =
      "border-[#10b981] bg-[#10b981]/10 text-[#059669] opacity-60 pointer-events-none scale-[0.98]";
  } else if (isSelected) {
    stateClasses =
      "border-[#9333ea] bg-[#9333ea]/5 ring-2 ring-[#9333ea]/30 text-[#000000] shadow-sm cursor-pointer";
  } else if (isMismatch) {
    stateClasses =
      "border-[#ef4444] bg-[#fef2f2] text-[#dc2626] animate-shake shadow-sm cursor-pointer";
  } else if (disabled) {
    stateClasses =
      "border-[#e5e5e5] bg-[#fafafa] text-[#a3a3a3] pointer-events-none";
  }

  return (
    // Stable outer anchor container to eliminate 60Hz hover jitter
    <div className="w-full relative py-0.5">
      <div
        role="button"
        tabIndex={isInteractive ? 0 : -1}
        aria-pressed={isSelected}
        aria-disabled={!isInteractive}
        aria-label={`${tile.text} ${tile.phonetic || ""}`}
        onClick={handleTileClick}
        onKeyDown={handleKeyDown}
        className={`w-full min-h-[64px] sm:min-h-[72px] px-4 py-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9333ea] ${stateClasses}`}
      >
        {/* Left content: text & optional phonetic */}
        <div className="flex-1 min-w-0 select-none">
          <span className="block text-sm sm:text-base font-semibold font-sans tracking-tight break-words leading-snug">
            {tile.text}
          </span>
          {tile.phonetic && (
            <span className="block text-xs font-mono text-[#737373] mt-0.5 tracking-normal truncate">
              {tile.phonetic}
            </span>
          )}
        </div>

        {/* Right content: Speaker pronunciation button & Hotkey badge */}
        <div className="flex items-center gap-2 shrink-0">
          {tile.audioUrl && (
            <button
              type="button"
              aria-label="Phát âm"
              onClick={handleSpeakerClick}
              disabled={!isInteractive}
              className="p-1.5 rounded-full text-[#737373] hover:text-[#9333ea] hover:bg-[#fafafa] transition-colors focus:outline-none disabled:opacity-40"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}

          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md border border-[#e5e5e5] bg-[#fafafa] text-[#737373] font-mono text-[11px] font-medium select-none">
            {hotkeyLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
