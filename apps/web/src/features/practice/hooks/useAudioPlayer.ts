import { useState, useRef, useCallback, useEffect } from "react";

export type AudioSourceType = "REMOTE_MP3" | "WEB_SPEECH_TTS" | "NONE";

export interface UseAudioPlayerReturn {
  isPlaying: boolean;
  playbackSpeed: number;
  audioSourceType: AudioSourceType;
  isFallbackTTS: boolean;
  needsUserGesture: boolean;
  hasError: boolean;
  playAudio: (word: string, audioUrl?: string | null) => Promise<void>;
  stopAudio: () => void;
  setSpeed: (speed: number) => void;
  toggleSpeed: () => void;
  replayAudio: () => Promise<void>;
  unlockAudio: () => Promise<void>;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [audioSourceType, setAudioSourceType] =
    useState<AudioSourceType>("NONE");
  const [needsUserGesture, setNeedsUserGesture] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentWordRef = useRef<string>("");
  const currentAudioUrlRef = useRef<string | null | undefined>(null);
  const speedRef = useRef<number>(1.0);

  useEffect(() => {
    speedRef.current = playbackSpeed;
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const playTTS = useCallback((word: string, speed: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setHasError(true);
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = speed;

    utterance.onstart = () => {
      setIsPlaying(true);
      setAudioSourceType("WEB_SPEECH_TTS");
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setHasError(true);
    };

    setAudioSourceType("WEB_SPEECH_TTS");
    window.speechSynthesis.speak(utterance);
  }, []);

  const playAudio = useCallback(
    async (word: string, audioUrl?: string | null): Promise<void> => {
      currentWordRef.current = word;
      currentAudioUrlRef.current = audioUrl;
      setHasError(false);

      stopAudio();

      if (!audioUrl) {
        playTTS(word, speedRef.current);
        return;
      }

      try {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.playbackRate = speedRef.current;

        audio.onended = () => {
          setIsPlaying(false);
        };

        audio.onerror = () => {
          // Failover to Web Speech API
          playTTS(word, speedRef.current);
        };

        setIsPlaying(true);
        setAudioSourceType("REMOTE_MP3");
        await audio.play();
        setNeedsUserGesture(false);
      } catch (err: unknown) {
        const error = err as { name?: string };
        if (error?.name === "NotAllowedError") {
          setNeedsUserGesture(true);
          setIsPlaying(false);
        } else {
          // Remote playback failed, cascade failover to TTS
          playTTS(word, speedRef.current);
        }
      }
    },
    [stopAudio, playTTS],
  );

  const setSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);

  const toggleSpeed = useCallback(() => {
    setPlaybackSpeed((prev) => (prev === 1.0 ? 0.75 : 1.0));
  }, []);

  const replayAudio = useCallback(async (): Promise<void> => {
    if (audioRef.current && currentAudioUrlRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = speedRef.current;
      try {
        setIsPlaying(true);
        await audioRef.current.play();
        return;
      } catch {
        // fall through to playAudio
      }
    }
    await playAudio(currentWordRef.current, currentAudioUrlRef.current);
  }, [playAudio]);

  const unlockAudio = useCallback(async (): Promise<void> => {
    setNeedsUserGesture(false);
    await replayAudio();
  }, [replayAudio]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return {
    isPlaying,
    playbackSpeed,
    audioSourceType,
    isFallbackTTS: audioSourceType === "WEB_SPEECH_TTS",
    needsUserGesture,
    hasError,
    playAudio,
    stopAudio,
    setSpeed,
    toggleSpeed,
    replayAudio,
    unlockAudio,
  };
}
