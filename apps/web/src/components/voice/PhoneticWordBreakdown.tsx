import type { DiffSpan, IpaSyllableToken } from "@wordstreak/shared-types";
import { parseIpaSyllables } from "../../utils/ipaSyllableParser";

export interface PhoneticWordBreakdownProps {
  phonetic?: string | null;
  diffSpans?: DiffSpan[];
  onPlaySyllable?: (syllable: string) => void;
  className?: string;
}

export function PhoneticWordBreakdown({
  phonetic,
  diffSpans,
  onPlaySyllable,
  className = "",
}: PhoneticWordBreakdownProps) {
  const syllables: IpaSyllableToken[] = parseIpaSyllables(phonetic);

  return (
    <div
      className={`flex flex-col items-center gap-3 ${className}`}
      data-testid="phonetic-word-breakdown"
    >
      {/* Interactive IPA Syllable Chips */}
      {syllables.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {syllables.map((token, idx) => {
            const isPrimary = token.isPrimaryStress;
            const isSecondary = token.isSecondaryStress;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onPlaySyllable?.(token.syllable)}
                title={`Play syllable "${token.syllable}"`}
                data-testid={`syllable-chip-${idx}`}
                className={`group relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-mono transition-all duration-150 active:scale-95 cursor-pointer border ${
                  isPrimary
                    ? "border-purple-400 bg-purple-50 text-purple-900 font-bold shadow-xs hover:border-purple-600 hover:bg-purple-100"
                    : isSecondary
                      ? "border-neutral-300 bg-neutral-50 text-neutral-800 font-medium hover:border-neutral-400"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                {isPrimary && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-purple-600"
                    title="Primary Stress"
                  />
                )}
                {isSecondary && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-neutral-400"
                    title="Secondary Stress"
                  />
                )}
                <span>{token.syllable}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Character Diff Breakdown */}
      {diffSpans && diffSpans.length > 0 && (
        <div
          className="flex items-center justify-center flex-wrap gap-0.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-mono tracking-wide"
          data-testid="diff-breakdown"
        >
          {diffSpans.map((span, idx) => {
            if (span.type === "MATCH") {
              return (
                <span
                  key={idx}
                  className="text-emerald-700 font-semibold"
                  data-testid="diff-match"
                >
                  {span.char}
                </span>
              );
            }
            if (span.type === "MISSING") {
              return (
                <span
                  key={idx}
                  className="text-red-500 line-through bg-red-50 px-0.5 rounded"
                  title={`Missing: "${span.char}"`}
                  data-testid="diff-missing"
                >
                  {span.char}
                </span>
              );
            }
            if (span.type === "EXTRA") {
              return (
                <span
                  key={idx}
                  className="text-amber-600 bg-amber-50 px-0.5 rounded"
                  title={`Extra: "${span.char}"`}
                  data-testid="diff-extra"
                >
                  {span.char}
                </span>
              );
            }
            return (
              <span
                key={idx}
                className="text-red-600 bg-red-100 px-0.5 rounded font-bold"
                title={`Wrong: "${span.char}"`}
                data-testid="diff-wrong"
              >
                {span.char}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
