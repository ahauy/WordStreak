import React from "react";
import { motion } from "framer-motion";
import { Delete, RefreshCw } from "lucide-react";

interface AnagramTilePickerProps {
  scrambledLetters: string[];
  selectedIndices: number[];
  disabled?: boolean;
  onSelectTile: (index: number) => void;
  onRemoveLast: () => void;
  onClear: () => void;
}

export const AnagramTilePicker: React.FC<AnagramTilePickerProps> = ({
  scrambledLetters,
  selectedIndices,
  disabled = false,
  onSelectTile,
  onRemoveLast,
  onClear,
}) => {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Letter Tiles Grid */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-md w-full">
        {scrambledLetters.map((letter, index) => {
          const isSelected = selectedIndices.includes(index);
          return (
            <motion.button
              key={`${letter}-${index}`}
              type="button"
              disabled={disabled || isSelected}
              whileTap={!disabled && !isSelected ? { scale: 0.95 } : undefined}
              onClick={() => onSelectTile(index)}
              className={`w-11 h-12 sm:w-12 sm:h-13 rounded-xl flex items-center justify-center font-mono text-lg font-bold transition-all ${
                isSelected
                  ? "bg-[#f5f5f5] text-[#d4d4d4] border border-[#e5e5e5] cursor-not-allowed opacity-40"
                  : "bg-white text-[#000000] border border-[#e5e5e5] hover:border-[#000000] hover:shadow-sm cursor-pointer active:bg-[#f5f5f5]"
              }`}
              aria-label={`Select letter ${letter}`}
            >
              {letter.toUpperCase()}
            </motion.button>
          );
        })}
      </div>

      {/* Anagram Helper Actions */}
      <div className="flex items-center gap-2 mt-1">
        <button
          type="button"
          disabled={disabled || selectedIndices.length === 0}
          onClick={onRemoveLast}
          className="px-3 py-1.5 rounded-full border border-[#e5e5e5] bg-white text-xs font-medium text-[#737373] hover:text-[#000000] hover:border-[#a3a3a3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          title="Remove last letter"
        >
          <Delete className="w-3.5 h-3.5" />
          Backspace
        </button>

        <button
          type="button"
          disabled={disabled || selectedIndices.length === 0}
          onClick={onClear}
          className="px-3 py-1.5 rounded-full border border-[#e5e5e5] bg-white text-xs font-medium text-[#737373] hover:text-[#000000] hover:border-[#a3a3a3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          title="Clear all letters"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>
    </div>
  );
};
