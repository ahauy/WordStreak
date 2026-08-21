import { useState, useRef, useCallback, useEffect } from "react";

export type AudioAccent = "en-US" | "en-GB";

export interface UseAudioSynthesizerOptions {
  defaultAccent?: AudioAccent;
  defaultSpeed?: number;
}

export interface UseAudioSynthesizerReturn {
  isPlaying: boolean;
  activeAccent: AudioAccent;
  playbackSpeed: number;
  setActiveAccent: (accent: AudioAccent) => void;
  setPlaybackSpeed: (speed: number) => void;
  togglePlaybackSpeed: () => void;
  playWord: (
    word: string,
    audioUrl?: string | null,
    accentOverride?: AudioAccent,
    speedOverride?: number,
  ) => Promise<void>;
  speakText: (
    text: string,
    accentOverride?: AudioAccent,
    speedOverride?: number,
  ) => Promise<void>;
  stop: () => void;
}

/**
 * Finds the best available SpeechSynthesisVoice for a target language locale.
 */
function findMatchingVoice(
  voices: SpeechSynthesisVoice[],
  locale: string,
): SpeechSynthesisVoice | undefined {
  return (
    voices.find((v) => v.lang === locale) ||
    voices.find((v) => v.lang.startsWith(locale.substring(0, 2)))
  );
}

export function useAudioSynthesizer(
  options: UseAudioSynthesizerOptions = {},
): UseAudioSynthesizerReturn {
  const { defaultAccent = "en-US", defaultSpeed = 1.0 } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAccent, setActiveAccent] = useState<AudioAccent>(defaultAccent);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(defaultSpeed);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsPlaying(false);
  }, []);

  const togglePlaybackSpeed = useCallback(() => {
    setPlaybackSpeed((prev) => (prev === 1.0 ? 0.75 : 1.0));
  }, []);

  const speakViaWebSpeech = useCallback(
    (text: string, accent: AudioAccent, speed: number): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          setIsPlaying(false);
          resolve();
          return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = accent;
        utterance.rate = speed;

        const voices = window.speechSynthesis.getVoices();
        const matchedVoice = findMatchingVoice(voices, accent);
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => {
          setIsPlaying(false);
          resolve();
        };
        utterance.onerror = () => {
          setIsPlaying(false);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [],
  );

  const playWord = useCallback(
    async (
      word: string,
      audioUrl?: string | null,
      accentOverride?: AudioAccent,
      speedOverride?: number,
    ): Promise<void> => {
      stop();

      const targetAccent = accentOverride || activeAccent;
      const targetSpeed = speedOverride ?? playbackSpeed;

      if (!audioUrl) {
        return speakViaWebSpeech(word, targetAccent, targetSpeed);
      }

      return new Promise<void>((resolve) => {
        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;

        audio.playbackRate = targetSpeed;
        audio.preservesPitch = true;
        (
          audio as unknown as { webkitPreservesPitch: boolean }
        ).webkitPreservesPitch = true;
        (audio as unknown as { mozPreservesPitch: boolean }).mozPreservesPitch =
          true;

        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
          activeAudioRef.current = null;
          resolve();
        };
        audio.onerror = () => {
          // Transparent fallback to Web Speech Synthesis on audio URL error
          activeAudioRef.current = null;
          speakViaWebSpeech(word, targetAccent, targetSpeed).then(resolve);
        };

        audio.play().catch(() => {
          activeAudioRef.current = null;
          speakViaWebSpeech(word, targetAccent, targetSpeed).then(resolve);
        });
      });
    },
    [stop, activeAccent, playbackSpeed, speakViaWebSpeech],
  );

  const speakText = useCallback(
    async (
      text: string,
      accentOverride?: AudioAccent,
      speedOverride?: number,
    ): Promise<void> => {
      stop();
      const targetAccent = accentOverride || activeAccent;
      const targetSpeed = speedOverride ?? playbackSpeed;
      return speakViaWebSpeech(text, targetAccent, targetSpeed);
    },
    [stop, activeAccent, playbackSpeed, speakViaWebSpeech],
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isPlaying,
    activeAccent,
    playbackSpeed,
    setActiveAccent,
    setPlaybackSpeed,
    togglePlaybackSpeed,
    playWord,
    speakText,
    stop,
  };
}
