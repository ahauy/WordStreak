import { useState, useRef, useCallback } from "react";
import {
  VoicePronunciationTier,
  VoiceEvaluationMode,
  type VoicePracticeState,
  type VoicePronunciationResultDto,
} from "@wordstreak/shared-types";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useAudioVisualizer } from "./useAudioVisualizer";
import { useAudioSynthesizer, type AudioAccent } from "./useAudioSynthesizer";
import {
  calculateAccuracyScore,
  getPronunciationTier,
  computePronunciationDiff,
} from "../utils/pronunciationScoring";
import { practiceService } from "../features/practice/services/practiceService";

export interface UseVoicePracticeEngineOptions {
  cardId: string;
  targetWord: string;
  audioUrlUS?: string | null;
  audioUrlUK?: string | null;
  phonetic?: string | null;
  evaluationMode?: VoiceEvaluationMode;
  onSuccess?: (result: VoicePronunciationResultDto) => void;
}

export interface UseVoicePracticeEngineReturn {
  state: VoicePracticeState;
  result: VoicePronunciationResultDto | null;
  transcript: string;
  interimTranscript: string;
  bars: number[];
  volume: number;
  accent: AudioAccent;
  playbackSpeed: number;
  error: string | null;
  isAudioPlaying: boolean;
  setAccent: (accent: AudioAccent) => void;
  toggleSpeed: () => void;
  startPractice: () => Promise<void>;
  stopPractice: () => void;
  retry: () => void;
  playNativeAudio: (speedOverride?: number) => Promise<void>;
  playSyllable: (syllable: string) => Promise<void>;
}

/**
 * Synthesizes instantaneous Web Audio chimes for scoring feedback.
 */
function playScoringChime(tier: VoicePronunciationTier) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (tier === VoicePronunciationTier.EXACT) {
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.2, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.35);
      });
    } else if (tier === VoicePronunciationTier.CLOSE) {
      const freqs = [659.25, 880.0]; // E5, A5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.18, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    } else {
      const freqs = [440.0, 349.23]; // A4 -> F4
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.15, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.3);
      });
    }
  } catch {
    // Ignored in test/SSR contexts
  }
}

export function useVoicePracticeEngine(
  options: UseVoicePracticeEngineOptions,
): UseVoicePracticeEngineReturn {
  const {
    cardId,
    targetWord,
    audioUrlUS,
    audioUrlUK,
    evaluationMode = VoiceEvaluationMode.STRICT,
    onSuccess,
  } = options;

  const [state, setState] = useState<VoicePracticeState>("IDLE");
  const [result, setResult] = useState<VoicePronunciationResultDto | null>(
    null,
  );
  const [engineError, setEngineError] = useState<string | null>(null);

  const startTimeRef = useRef<number>(0);
  const isEvaluatingRef = useRef<boolean>(false);

  const visualizer = useAudioVisualizer({ barCount: 5 });
  const synthesizer = useAudioSynthesizer({ defaultAccent: "en-US" });

  const evaluateSpeech = useCallback(
    async (finalTranscript: string) => {
      if (isEvaluatingRef.current) return;
      isEvaluatingRef.current = true;

      setState("PROCESSING");
      visualizer.stopSampling();

      const timeSpentMs = startTimeRef.current
        ? Date.now() - startTimeRef.current
        : 1000;

      const score = calculateAccuracyScore(targetWord, finalTranscript);
      const tier = getPronunciationTier(score);
      const diffSpans = computePronunciationDiff(targetWord, finalTranscript);
      const isPassed = score >= 80;

      playScoringChime(tier);

      const localResult: VoicePronunciationResultDto = {
        isPassed,
        accuracyScore: score,
        tier,
        xpAwarded: isPassed ? 10 : 0,
        isDailyCapped: false,
        streakAdvanced: isPassed,
        diffSpans,
      };

      try {
        const response = await practiceService.submitVoicePronunciation({
          cardId,
          targetWord,
          spokenTranscript: finalTranscript,
          accuracyScore: score,
          accent: synthesizer.activeAccent,
          timeSpentMs,
          evaluationMode,
        });

        if (response.data) {
          const finalResult: VoicePronunciationResultDto = {
            ...localResult,
            ...response.data,
            diffSpans: response.data.diffSpans || diffSpans,
          };
          setResult(finalResult);
          if (finalResult.isPassed) onSuccess?.(finalResult);
        } else {
          setResult(localResult);
          if (localResult.isPassed) onSuccess?.(localResult);
        }
      } catch {
        // Fall back to local evaluation if network is offline or unauthenticated
        setResult(localResult);
        if (localResult.isPassed) onSuccess?.(localResult);
      } finally {
        setState("EVALUATED");
        isEvaluatingRef.current = false;
      }
    },
    [
      targetWord,
      cardId,
      synthesizer.activeAccent,
      evaluationMode,
      visualizer,
      onSuccess,
    ],
  );

  const speech = useSpeechRecognition({
    lang: synthesizer.activeAccent,
    silenceTimeoutMs: 2500,
    maxDurationMs: 8000,
    onError: (err) => {
      if (err.includes("denied")) {
        setState("PERMISSION_DENIED");
      } else {
        setState("ERROR");
        setEngineError(err);
      }
      visualizer.stopSampling();
    },
    onEnd: (finalTranscript) => {
      const recognized = finalTranscript || speech.transcript;
      if (recognized.trim()) {
        evaluateSpeech(recognized.trim());
      } else {
        visualizer.stopSampling();
        setState("IDLE");
      }
    },
  });

  const startPractice = useCallback(async () => {
    setResult(null);
    setEngineError(null);
    isEvaluatingRef.current = false;
    startTimeRef.current = Date.now();

    if (speech.permissionState === "denied") {
      setState("PERMISSION_DENIED");
      return;
    }

    try {
      setState("LISTENING");
      await speech.startListening(synthesizer.activeAccent);
      await visualizer.startSampling();
    } catch {
      setState("ERROR");
      setEngineError("Failed to access microphone.");
      visualizer.stopSampling();
    }
  }, [speech, visualizer, synthesizer.activeAccent]);

  const stopPractice = useCallback(() => {
    speech.stopListening();
    visualizer.stopSampling();
    if (speech.transcript.trim()) {
      evaluateSpeech(speech.transcript.trim());
    } else {
      setState("IDLE");
    }
  }, [speech, visualizer, evaluateSpeech]);

  const retry = useCallback(() => {
    setResult(null);
    setEngineError(null);
    speech.resetTranscript();
    setState("IDLE");
  }, [speech]);

  const playNativeAudio = useCallback(
    async (speedOverride?: number) => {
      const url =
        synthesizer.activeAccent === "en-US" ? audioUrlUS : audioUrlUK;
      await synthesizer.playWord(
        targetWord,
        url,
        synthesizer.activeAccent,
        speedOverride,
      );
    },
    [synthesizer, targetWord, audioUrlUS, audioUrlUK],
  );

  const playSyllable = useCallback(
    async (syllable: string) => {
      await synthesizer.speakText(syllable, synthesizer.activeAccent, 0.75);
    },
    [synthesizer],
  );

  return {
    state,
    result,
    transcript: speech.transcript,
    interimTranscript: speech.interimTranscript,
    bars: visualizer.bars,
    volume: visualizer.volume,
    accent: synthesizer.activeAccent,
    playbackSpeed: synthesizer.playbackSpeed,
    error: engineError || speech.error,
    isAudioPlaying: synthesizer.isPlaying,
    setAccent: synthesizer.setActiveAccent,
    toggleSpeed: synthesizer.togglePlaybackSpeed,
    startPractice,
    stopPractice,
    retry,
    playNativeAudio,
    playSyllable,
  };
}
