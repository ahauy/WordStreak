import React, { useRef, useEffect } from "react";
import { CheckCircle2, XCircle, CornerDownLeft } from "lucide-react";
import type { DiffSpan } from "@wordstreak/shared-types";

export interface ListeningTypingInputProps {
  value: string;
  wordLength: number;
  feedbackState: "IDLE" | "CORRECT" | "INCORRECT";
  characterDiff: DiffSpan[] | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const ListeningTypingInput: React.FC<ListeningTypingInputProps> = ({
  value,
  wordLength,
  feedbackState,
  characterDiff,
  onChange,
  onSubmit,
  disabled = false,
  autoFocus = true,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus && !disabled && feedbackState === "IDLE") {
      inputRef.current?.focus();
    }
  }, [autoFocus, disabled, feedbackState]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !disabled) {
      e.preventDefault();
      onSubmit();
    }
  };

  const isCorrect = feedbackState === "CORRECT";
  const isIncorrect = feedbackState === "INCORRECT";

  return (
    <div className="w-full space-y-3">
      {/* Input Box Container */}
      <div
        data-testid="typing-input-container"
        className={`relative flex items-center bg-white border-2 rounded-2xl px-4 py-3.5 transition-all shadow-sm ${
          isCorrect
            ? "border-[#27c93f] bg-[#f0fdf4]"
            : isIncorrect
              ? "border-[#ff5f56] bg-[#fef2f2]"
              : "border-[#e5e5e5] focus-within:border-[#000000]"
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || feedbackState !== "IDLE"}
          placeholder="Nhập từ bạn nghe được..."
          aria-label="Nhập từ vựng"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck="false"
          className="w-full bg-transparent font-mono text-lg text-[#000000] placeholder:text-[#a3a3a3] outline-none tracking-wide"
        />

        {/* Right Status Indicator */}
        <div className="flex items-center gap-2 pl-3 shrink-0">
          {isCorrect && (
            <div
              data-testid="feedback-correct-icon"
              className="text-[#27c93f] flex items-center gap-1 font-sans text-xs font-semibold"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Chính xác</span>
            </div>
          )}

          {isIncorrect && (
            <div
              data-testid="feedback-incorrect-icon"
              className="text-[#ff5f56] flex items-center gap-1 font-sans text-xs font-semibold"
            >
              <XCircle className="w-5 h-5" />
              <span>Chưa đúng</span>
            </div>
          )}

          {feedbackState === "IDLE" && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={disabled || !value.trim()}
              aria-label="Xác nhận câu trả lời"
              className={`p-2 rounded-full transition-all ${
                value.trim()
                  ? "bg-[#000000] text-white hover:bg-[#171717] active:scale-95 shadow-sm"
                  : "bg-[#fafafa] text-[#a3a3a3] cursor-not-allowed border border-[#e5e5e5]"
              }`}
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Character Slots Visualizer */}
      {feedbackState === "IDLE" && wordLength > 0 && (
        <div
          data-testid="character-slots"
          className="flex items-center justify-center gap-1.5 pt-1"
        >
          {Array.from({ length: wordLength }).map((_, idx) => {
            const isFilled = idx < value.length;
            const currentChar = value[idx] || "";
            return (
              <div
                key={idx}
                className={`w-7 h-9 rounded-lg border flex items-center justify-center font-mono text-sm font-bold transition-colors ${
                  isFilled
                    ? "border-[#000000] bg-white text-[#000000] shadow-2xs"
                    : "border-[#e5e5e5] bg-[#fafafa] text-[#d4d4d4]"
                }`}
              >
                {isFilled ? currentChar : "•"}
              </div>
            );
          })}
        </div>
      )}

      {/* Character Diff Visualizer for Incorrect Feedback */}
      {isIncorrect && characterDiff && characterDiff.length > 0 && (
        <div
          data-testid="character-diff-view"
          className="bg-white border border-[#e5e5e5] rounded-2xl p-4 space-y-2.5 shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-[#737373] uppercase tracking-wider">
              Chi tiết lỗi chính tả (Spelling Diff)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 py-1 font-mono text-sm">
            {characterDiff.map((span, idx) => {
              if (span.type === "MATCH") {
                return (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-md bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] font-semibold"
                  >
                    {span.char}
                  </span>
                );
              }
              if (span.type === "MISSING") {
                return (
                  <span
                    key={idx}
                    title="Ký tự bị thiếu"
                    className="px-2 py-1 rounded-md bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] font-bold underline"
                  >
                    {span.char}
                  </span>
                );
              }
              if (span.type === "EXTRA" || span.type === "WRONG") {
                return (
                  <span
                    key={idx}
                    title="Ký tự sai / thừa"
                    className="px-2 py-1 rounded-md bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] line-through font-semibold"
                  >
                    {span.char}
                  </span>
                );
              }
              return (
                <span key={idx} className="px-2 py-1">
                  {span.char}
                </span>
              );
            })}
          </div>

          <p className="text-[11px] font-sans text-[#737373]">
            Ký tự màu xanh dương bị thiếu; ký tự gạch ngang đỏ bị sai hoặc thừa.
          </p>
        </div>
      )}
    </div>
  );
};
