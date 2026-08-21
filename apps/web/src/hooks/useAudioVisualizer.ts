import { useState, useEffect, useRef, useCallback } from "react";

export interface UseAudioVisualizerOptions {
  barCount?: number;
  fftSize?: number;
  smoothingTimeConstant?: number;
}

export interface UseAudioVisualizerReturn {
  bars: number[];
  volume: number;
  isSampling: boolean;
  startSampling: (stream?: MediaStream) => Promise<void>;
  stopSampling: () => void;
}

/**
 * Computes root-mean-square (RMS) volume and frequency bin bars for audio visualization.
 */
function extractFrequencyBars(
  dataArray: Uint8Array,
  barCount: number,
): { bars: number[]; rmsVolume: number } {
  const step = Math.max(1, Math.floor(dataArray.length / barCount));
  const bars: number[] = [];
  let totalSquare = 0;

  for (let i = 0; i < barCount; i++) {
    const start = i * step;
    const end = Math.min(start + step, dataArray.length);
    let sum = 0;
    let count = 0;

    for (let j = start; j < end; j++) {
      const val = dataArray[j] / 255;
      sum += val;
      totalSquare += val * val;
      count++;
    }

    const avg = count > 0 ? sum / count : 0;
    bars.push(Math.min(1, Math.max(0, avg)));
  }

  const rms = Math.sqrt(totalSquare / Math.max(1, dataArray.length));
  return { bars, rmsVolume: Math.min(1, Math.max(0, rms)) };
}

export function useAudioVisualizer(
  options: UseAudioVisualizerOptions = {},
): UseAudioVisualizerReturn {
  const { barCount = 5, fftSize = 64, smoothingTimeConstant = 0.8 } = options;

  const [bars, setBars] = useState<number[]>(() => Array(barCount).fill(0));
  const [volume, setVolume] = useState<number>(0);
  const [isSampling, setIsSampling] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const internalStreamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const stopSampling = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch {
        // Ignored
      }
      sourceRef.current = null;
    }

    if (internalStreamRef.current) {
      internalStreamRef.current.getTracks().forEach((track) => track.stop());
      internalStreamRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      try {
        audioCtxRef.current.close();
      } catch {
        // Ignored
      }
      audioCtxRef.current = null;
    }

    setIsSampling(false);
    setBars(Array(barCount).fill(0));
    setVolume(0);
  }, [barCount]);

  const tickVisualizerRef = useRef<() => void>(() => {});

  const tickVisualizer = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const { bars: nextBars, rmsVolume } = extractFrequencyBars(
      dataArray,
      barCount,
    );

    setBars(nextBars);
    setVolume(rmsVolume);

    rafIdRef.current = requestAnimationFrame(() => {
      tickVisualizerRef.current();
    });
  }, [barCount]);

  useEffect(() => {
    tickVisualizerRef.current = tickVisualizer;
  }, [tickVisualizer]);

  const startSampling = useCallback(
    async (providedStream?: MediaStream) => {
      stopSampling();

      try {
        let stream = providedStream;
        if (!stream) {
          if (!navigator?.mediaDevices?.getUserMedia) {
            return;
          }
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          internalStreamRef.current = stream;
        }

        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;

        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        if (ctx.state === "suspended") {
          await ctx.resume();
        }

        const analyser = ctx.createAnalyser();
        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = smoothingTimeConstant;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
        setIsSampling(true);

        rafIdRef.current = requestAnimationFrame(tickVisualizer);
      } catch {
        stopSampling();
      }
    },
    [stopSampling, fftSize, smoothingTimeConstant, tickVisualizer],
  );

  useEffect(() => {
    return () => {
      stopSampling();
    };
  }, [stopSampling]);

  return {
    bars,
    volume,
    isSampling,
    startSampling,
    stopSampling,
  };
}
