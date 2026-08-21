import type { AudioAccent } from "../../hooks/useAudioSynthesizer";

export interface AccentAudioSelectorProps {
  activeAccent: AudioAccent;
  playbackSpeed: number;
  isPlaying?: boolean;
  onSelectAccent: (accent: AudioAccent) => void;
  onToggleSpeed: () => void;
  onPlayAudio: () => void;
  className?: string;
}

export function AccentAudioSelector({
  activeAccent,
  playbackSpeed,
  isPlaying = false,
  onSelectAccent,
  onToggleSpeed,
  onPlayAudio,
  className = "",
}: AccentAudioSelectorProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 w-full max-w-md ${className}`}
      data-testid="accent-audio-selector"
    >
      {/* Accent selection tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-full border border-neutral-200">
        <button
          type="button"
          onClick={() => onSelectAccent("en-US")}
          data-testid="accent-tab-us"
          aria-pressed={activeAccent === "en-US"}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer ${
            activeAccent === "en-US"
              ? "bg-black text-white shadow-xs"
              : "text-neutral-600 hover:text-black"
          }`}
        >
          US (General)
        </button>
        <button
          type="button"
          onClick={() => onSelectAccent("en-GB")}
          data-testid="accent-tab-uk"
          aria-pressed={activeAccent === "en-GB"}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer ${
            activeAccent === "en-GB"
              ? "bg-black text-white shadow-xs"
              : "text-neutral-600 hover:text-black"
          }`}
        >
          UK (RP)
        </button>
      </div>

      {/* Speed & Play Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSpeed}
          data-testid="speed-toggle-button"
          title="Toggle 0.75x pitch-preserved slow speed"
          aria-label={`Playback speed ${playbackSpeed}x`}
          className={`px-2.5 py-1 text-xs font-mono font-medium rounded-full border transition-all duration-150 cursor-pointer ${
            playbackSpeed === 0.75
              ? "border-purple-500 bg-purple-50 text-purple-700 font-bold"
              : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400"
          }`}
        >
          {playbackSpeed === 0.75 ? "0.75x (Slow)" : "1.0x"}
        </button>

        <button
          type="button"
          onClick={onPlayAudio}
          disabled={isPlaying}
          data-testid="play-audio-button"
          aria-label="Play reference audio"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black text-white hover:bg-neutral-800 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50"
        >
          {isPlaying ? (
            <span className="w-2.5 h-2.5 rounded-xs bg-white animate-pulse" />
          ) : (
            <svg
              className="w-4 h-4 ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
