import { useState, useEffect, useRef, useCallback } from "react";

export type MicPermissionState =
  "granted" | "denied" | "prompt" | "unsupported";

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  silenceTimeoutMs?: number;
  maxDurationMs?: number;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: (finalTranscript: string) => void;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  permissionState: MicPermissionState;
  error: string | null;
  startListening: (langOverride?: string) => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
  checkPermission: () => Promise<MicPermissionState>;
}

// Window type augmentation for Web Speech API
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onspeechstart?: (() => void) | null;
  onspeechend?: (() => void) | null;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionReturn {
  const {
    lang = "en-US",
    continuous = false,
    interimResults = true,
    silenceTimeoutMs = 2500,
    maxDurationMs = 8000,
    onResult,
    onError,
    onEnd,
  } = options;

  const [isSupported] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const win = window as unknown as WindowWithSpeech;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  });
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [permissionState, setPermissionState] = useState<MicPermissionState>(
    () => {
      if (typeof window === "undefined") return "unsupported";
      const win = window as unknown as WindowWithSpeech;
      return win.SpeechRecognition || win.webkitSpeechRecognition
        ? "prompt"
        : "unsupported";
    },
  );
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const finalTranscriptAccumulatorRef = useRef("");

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const clearMaxDurationTimer = useCallback(() => {
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    finalTranscriptAccumulatorRef.current = "";
    setError(null);
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    clearMaxDurationTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored if already stopped
      }
    }
    setIsListening(false);
  }, [clearSilenceTimer, clearMaxDurationTimer]);

  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    if (silenceTimeoutMs > 0) {
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, silenceTimeoutMs);
    }
  }, [clearSilenceTimer, silenceTimeoutMs, stopListening]);

  const checkPermission = useCallback(async (): Promise<MicPermissionState> => {
    if (typeof window === "undefined") return "unsupported";

    const win = window as unknown as WindowWithSpeech;
    const RecognitionClass =
      win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!RecognitionClass) {
      setPermissionState("unsupported");
      return "unsupported";
    }

    try {
      if (navigator.permissions && navigator.permissions.query) {
        const status = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        const mappedState: MicPermissionState =
          status.state === "granted"
            ? "granted"
            : status.state === "denied"
              ? "denied"
              : "prompt";
        setPermissionState(mappedState);
        return mappedState;
      }
    } catch {
      // Fall through to prompt
    }
    return "prompt";
  }, []);

  // Query microphone permission state asynchronously
  useEffect(() => {
    let ignore = false;
    if (typeof window === "undefined" || !navigator?.permissions?.query) return;

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((status) => {
        if (ignore) return;
        const mappedState: MicPermissionState =
          status.state === "granted"
            ? "granted"
            : status.state === "denied"
              ? "denied"
              : "prompt";
        setPermissionState(mappedState);

        status.onchange = () => {
          if (!ignore) {
            const nextState: MicPermissionState =
              status.state === "granted"
                ? "granted"
                : status.state === "denied"
                  ? "denied"
                  : "prompt";
            setPermissionState(nextState);
          }
        };
      })
      .catch(() => {
        // Ignored if query fails
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Initialize SpeechRecognition instance
  useEffect(() => {
    if (typeof window === "undefined") return;

    const win = window as unknown as WindowWithSpeech;
    const RecognitionClass =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!RecognitionClass) {
      return;
    }

    const instance = new RecognitionClass();
    instance.continuous = continuous;
    instance.interimResults = interimResults;
    instance.lang = lang;

    instance.onresult = (event: SpeechRecognitionEventLike) => {
      resetSilenceTimer();
      let currentInterim = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) {
          const finalPiece = res[0]?.transcript?.trim() || "";
          if (finalPiece) {
            finalTranscriptAccumulatorRef.current = finalPiece;
            setTranscript(finalPiece);
            onResult?.(finalPiece, true);
          }
        } else {
          currentInterim += res[0]?.transcript || "";
        }
      }

      setInterimTranscript(currentInterim);
      if (currentInterim) {
        onResult?.(currentInterim, false);
      }
    };

    instance.onerror = (event: SpeechRecognitionErrorEventLike) => {
      clearSilenceTimer();
      clearMaxDurationTimer();
      setIsListening(false);

      if (
        event.error === "not-allowed" ||
        event.error === "permission-denied"
      ) {
        setPermissionState("denied");
        setError("Microphone permission was denied.");
        onError?.("Microphone permission was denied.");
      } else if (event.error !== "no-speech") {
        setError(event.error || "Speech recognition error");
        onError?.(event.error || "Speech recognition error");
      }
    };

    instance.onend = () => {
      clearSilenceTimer();
      clearMaxDurationTimer();
      setIsListening(false);
      onEnd?.(finalTranscriptAccumulatorRef.current);
    };

    recognitionRef.current = instance;

    return () => {
      clearSilenceTimer();
      clearMaxDurationTimer();
      try {
        instance.abort();
      } catch {
        // Ignored
      }
    };
  }, [
    continuous,
    interimResults,
    lang,
    clearSilenceTimer,
    clearMaxDurationTimer,
    resetSilenceTimer,
    onResult,
    onError,
    onEnd,
  ]);

  const startListening = useCallback(
    async (langOverride?: string) => {
      resetTranscript();
      setError(null);

      if (!recognitionRef.current) {
        setError("Speech recognition is not supported in this browser.");
        return;
      }

      try {
        if (langOverride) {
          recognitionRef.current.lang = langOverride;
        }
        recognitionRef.current.start();
        setIsListening(true);
        setPermissionState("granted");

        // Silence watchdog starts immediately
        resetSilenceTimer();

        // Max duration watchdog
        if (maxDurationMs > 0) {
          clearMaxDurationTimer();
          maxDurationTimerRef.current = setTimeout(() => {
            stopListening();
          }, maxDurationMs);
        }
      } catch (err: unknown) {
        const errMsg =
          err instanceof Error ? err.message : "Failed to start microphone";
        setError(errMsg);
        setIsListening(false);
      }
    },
    [
      resetTranscript,
      resetSilenceTimer,
      maxDurationMs,
      clearMaxDurationTimer,
      stopListening,
    ],
  );

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    permissionState,
    error,
    startListening,
    stopListening,
    resetTranscript,
    checkPermission,
  };
}
