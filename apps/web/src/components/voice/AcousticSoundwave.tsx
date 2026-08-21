export interface AcousticSoundwaveProps {
  bars?: number[];
  isListening?: boolean;
  barCount?: number;
  className?: string;
}

export function AcousticSoundwave({
  bars = [0.1, 0.1, 0.1, 0.1, 0.1],
  isListening = false,
  barCount = 5,
  className = "",
}: AcousticSoundwaveProps) {
  const displayBars = bars.length >= barCount ? bars.slice(0, barCount) : bars;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`flex items-center justify-center gap-1.5 h-10 px-3 ${className}`}
      data-testid="acoustic-soundwave"
    >
      {displayBars.map((level, idx) => {
        // Compute min height 4px, max height 32px based on level 0..1
        const clampedLevel = isListening
          ? Math.max(0.12, Math.min(1, level))
          : 0.1;
        const barHeight = Math.round(clampedLevel * 32);

        return (
          <div
            key={idx}
            data-testid="soundwave-bar"
            className={`w-1.5 rounded-full transition-all duration-75 ease-out ${
              isListening
                ? "bg-purple-600 shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                : "bg-neutral-300"
            }`}
            style={{
              height: `${barHeight}px`,
            }}
          />
        );
      })}
    </div>
  );
}
