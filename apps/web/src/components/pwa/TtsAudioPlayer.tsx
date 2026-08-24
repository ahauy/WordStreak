import React, { useState, useRef, useCallback } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { getCachedMedia } from "../../services/offline/offlineDatabase";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

interface TtsAudioPlayerProps {
  audioUrl?: string | null;
  text: string;
  lang?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  ariaLabel?: string;
}

export const TtsAudioPlayer: React.FC<TtsAudioPlayerProps> = ({
  audioUrl,
  text,
  lang = "en-US",
  size = "md",
  className = "",
  ariaLabel = "Pronounce word",
}) => {
  const { isOnline } = useNetworkStatus();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [usedTts, setUsedTts] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSpeechSynthesis = useCallback(
    (textToSpeak: string, language: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language;
      utterance.rate = 0.9; // natural cadence

      // Pick high quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith(language.slice(0, 2)) &&
          !v.name.includes("whisper"),
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setUsedTts(true);
      };
      utterance.onend = () => {
        setIsPlaying(false);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [],
  );

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try Cached IndexedDB Audio
      if (audioUrl) {
        const cachedBlob = await getCachedMedia(audioUrl);
        if (cachedBlob) {
          const objectUrl = URL.createObjectURL(cachedBlob);
          const audio = new Audio(objectUrl);
          audioRef.current = audio;

          audio.onplay = () => {
            setIsPlaying(true);
            setIsLoading(false);
            setUsedTts(false);
          };
          audio.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(objectUrl);
          };
          audio.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            playSpeechSynthesis(text, lang);
            setIsLoading(false);
          };

          await audio.play();
          return;
        }
      }

      // 2. Try Online Remote Audio
      if (audioUrl && isOnline) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
          setUsedTts(false);
        };
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          playSpeechSynthesis(text, lang);
          setIsLoading(false);
        };

        await audio.play();
        return;
      }

      // 3. Fallback: Web Speech Synthesis API
      playSpeechSynthesis(text, lang);
    } catch {
      // Audio playback promise rejection -> fallback to TTS
      playSpeechSynthesis(text, lang);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
  }[size];

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={handlePlay}
        disabled={isLoading}
        aria-label={ariaLabel}
        className={`rounded-full flex items-center justify-center border border-[#e5e5e5] bg-white text-black hover:bg-[#fafafa] hover:border-[#d4d4d4] active:scale-95 transition-all cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${sizeClasses} ${className}`}
      >
        {isLoading ? (
          <Loader2 className={`${iconSizes} animate-spin text-black`} />
        ) : isPlaying ? (
          <Volume2 className={`${iconSizes} text-black animate-pulse`} />
        ) : (
          <Volume2 className={`${iconSizes} text-black`} />
        )}
      </button>

      {usedTts && (
        <span
          className="text-[10px] font-mono font-bold text-[#737373] bg-[#fafafa] border border-[#e5e5e5] px-1.5 py-0.5 rounded-full"
          title="Speech synthesized via browser TTS engine (offline)"
        >
          [TTS]
        </span>
      )}
    </div>
  );
};
