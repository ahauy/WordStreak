import React, { useEffect, useCallback } from "react";
import type {
  MatchingCardItemDto,
  MatchingTileState,
} from "@wordstreak/shared-types";
import { MatchingTile } from "./MatchingTile";

export interface MatchingGameBoardProps {
  wordTiles: MatchingCardItemDto[];
  meaningTiles: MatchingCardItemDto[];
  tileStates: Record<string, MatchingTileState>;
  selectedTileId: string | null;
  onSelectTile: (tileId: string) => void;
  onPlayAudio?: (audioUrl: string) => void;
  isLocked?: boolean;
  onToggleMute?: () => void;
  onExit?: () => void;
}

const LEFT_HOTKEYS = ["1", "2", "3", "4", "5"];
const RIGHT_HOTKEYS = ["Q", "W", "E", "R", "T"];
const RIGHT_HOTKEYS_NUMERIC = ["6", "7", "8", "9", "0"];

export const MatchingGameBoard: React.FC<MatchingGameBoardProps> = ({
  wordTiles,
  meaningTiles,
  tileStates,
  onSelectTile,
  onPlayAudio,
  isLocked = false,
  onToggleMute,
  onExit,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "Escape" && onExit) {
        e.preventDefault();
        onExit();
        return;
      }

      if (e.code === "Space" && onToggleMute) {
        e.preventDefault();
        onToggleMute();
        return;
      }

      if (isLocked) return;

      const keyUpper = e.key.toUpperCase();

      // Left Column Shortcuts: 1-5
      const leftIdx = LEFT_HOTKEYS.indexOf(e.key);
      if (leftIdx !== -1 && wordTiles[leftIdx]) {
        e.preventDefault();
        onSelectTile(wordTiles[leftIdx].id);
        return;
      }

      // Right Column Shortcuts: Q-T
      const rightIdx = RIGHT_HOTKEYS.indexOf(keyUpper);
      if (rightIdx !== -1 && meaningTiles[rightIdx]) {
        e.preventDefault();
        onSelectTile(meaningTiles[rightIdx].id);
        return;
      }

      // Alternate Right Column Shortcuts: 6-0
      const rightNumIdx = RIGHT_HOTKEYS_NUMERIC.indexOf(e.key);
      if (rightNumIdx !== -1 && meaningTiles[rightNumIdx]) {
        e.preventDefault();
        onSelectTile(meaningTiles[rightNumIdx].id);
        return;
      }
    },
    [wordTiles, meaningTiles, onSelectTile, isLocked, onToggleMute, onExit],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
        {/* Left Column: Words (Column A) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-mono font-bold text-[#737373] uppercase tracking-wider">
              Từ vựng (Vocabulary)
            </span>
            <span className="text-[11px] font-mono text-[#a3a3a3]">
              Phím tắt: 1 - 5
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {wordTiles.map((tile, idx) => (
              <MatchingTile
                key={tile.id}
                tile={tile}
                state={tileStates[tile.id] || "NEUTRAL"}
                hotkeyLabel={LEFT_HOTKEYS[idx] || String(idx + 1)}
                onSelect={onSelectTile}
                onPlayAudio={onPlayAudio}
                disabled={isLocked}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Meanings (Column B) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-mono font-bold text-[#737373] uppercase tracking-wider">
              Ý nghĩa (Definition)
            </span>
            <span className="text-[11px] font-mono text-[#a3a3a3]">
              Phím tắt: Q - T
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {meaningTiles.map((tile, idx) => (
              <MatchingTile
                key={tile.id}
                tile={tile}
                state={tileStates[tile.id] || "NEUTRAL"}
                hotkeyLabel={RIGHT_HOTKEYS[idx] || String(idx + 1)}
                onSelect={onSelectTile}
                onPlayAudio={onPlayAudio}
                disabled={isLocked}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
