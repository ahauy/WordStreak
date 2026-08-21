import { useState, useCallback, useRef, useEffect } from "react";

const MUTED_STORAGE_KEY = "wordstreak_matching_muted";
const MASTER_VOLUME = 0.25;

export interface WebAudioSynthesizer {
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  playSuccessChime: () => void;
  playMismatchBuzz: () => void;
  playComboDing: (comboCount?: number) => void;
}

export function useWebAudioSynthesizer(): WebAudioSynthesizer {
  const [isMuted, setIsMutedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MUTED_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new AudioContextClass();
      } catch (err) {
        console.warn("Failed to initialize AudioContext:", err);
        return null;
      }
    }

    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => null);
    }

    return audioCtxRef.current;
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setIsMutedState(muted);
    try {
      localStorage.setItem(MUTED_STORAGE_KEY, String(muted));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMutedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(MUTED_STORAGE_KEY, String(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  }, []);

  const playSuccessChime = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5

      gain.gain.setValueAtTime(MASTER_VOLUME, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (err) {
      console.warn("Error playing success chime:", err);
    }
  }, [isMuted, getAudioContext]);

  const playMismatchBuzz = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(120, now + 0.18);

      gain.gain.setValueAtTime(MASTER_VOLUME * 0.8, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (err) {
      console.warn("Error playing mismatch buzz:", err);
    }
  }, [isMuted, getAudioContext]);

  const playComboDing = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1046.5, now); // C6

      gain.gain.setValueAtTime(MASTER_VOLUME * 0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (err) {
      console.warn("Error playing combo ding:", err);
    }
  }, [isMuted, getAudioContext]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => null);
        audioCtxRef.current = null;
      }
    };
  }, []);

  return {
    isMuted,
    toggleMute,
    setMuted,
    playSuccessChime,
    playMismatchBuzz,
    playComboDing,
  };
}
