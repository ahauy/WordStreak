import { VoicePronunciationTier } from "@wordstreak/shared-types";

export interface PronunciationScoreBadgeProps {
  score: number;
  tier?: VoicePronunciationTier;
  xpAwarded?: number;
  isDailyCapped?: boolean;
  className?: string;
}

export function PronunciationScoreBadge({
  score,
  tier = VoicePronunciationTier.CLOSE,
  xpAwarded = 0,
  isDailyCapped = false,
  className = "",
}: PronunciationScoreBadgeProps) {
  const getBadgeTheme = (currentTier: VoicePronunciationTier) => {
    switch (currentTier) {
      case VoicePronunciationTier.EXACT:
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          label: "Exact Match",
        };
      case VoicePronunciationTier.CLOSE:
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          dot: "bg-purple-600",
          label: "Close Match",
        };
      case VoicePronunciationTier.RETRY:
      default:
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          label: "Needs Practice",
        };
    }
  };

  const theme = getBadgeTheme(tier);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm font-medium ${theme.bg} ${className}`}
      data-testid="pronunciation-score-badge"
    >
      <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
      <span className="font-semibold">{score}%</span>
      <span className="text-xs opacity-80 uppercase tracking-wider font-mono">
        {theme.label}
      </span>
      {xpAwarded > 0 && (
        <span className="ml-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-600 text-white shadow-xs">
          +{xpAwarded} XP
        </span>
      )}
      {isDailyCapped &&
        xpAwarded === 0 &&
        tier !== VoicePronunciationTier.RETRY && (
          <span className="ml-1 text-xs text-neutral-500 italic">
            (Daily XP Capped)
          </span>
        )}
    </div>
  );
}
