import { useEffect, useRef } from "react";
import { useVoicePracticeEngine } from "../../hooks/useVoicePracticeEngine";
import { AcousticSoundwave } from "./AcousticSoundwave";
import { PronunciationScoreBadge } from "./PronunciationScoreBadge";
import { PhoneticWordBreakdown } from "./PhoneticWordBreakdown";
import { AccentAudioSelector } from "./AccentAudioSelector";
import { MicPermissionBanner } from "./MicPermissionBanner";
import type { VoicePronunciationResultDto } from "@wordstreak/shared-types";

export interface PronunciationPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  targetWord: string;
  phonetic?: string | null;
  meaning?: string;
  audioUrlUS?: string | null;
  audioUrlUK?: string | null;
  onSuccess?: (result: VoicePronunciationResultDto) => void;
}

export function PronunciationPracticeModal({
  isOpen,
  onClose,
  cardId,
  targetWord,
  phonetic,
  meaning,
  audioUrlUS,
  audioUrlUK,
  onSuccess,
}: PronunciationPracticeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const engine = useVoicePracticeEngine({
    cardId,
    targetWord,
    audioUrlUS,
    audioUrlUK,
    phonetic,
    onSuccess,
  });

  // Focus restoration & modal trap
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Global keyboard shortcuts (Space to record/stop, R for replay, S for slow speed, Escape to close, Tab focus trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap for Tab key navigation within modal
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements =
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          );
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (
              document.activeElement === firstElement ||
              document.activeElement === modalRef.current
            ) {
              e.preventDefault();
              lastElement.focus();
              return;
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
              return;
            }
          }
        }
      }

      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;
      if (isInput) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (engine.state === "LISTENING") {
          engine.stopPractice();
        } else if (engine.state === "IDLE" || engine.state === "EVALUATED") {
          engine.startPractice();
        }
      } else if (
        e.key.toLowerCase() === "r" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        engine.playNativeAudio();
      } else if (
        e.key.toLowerCase() === "s" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        engine.toggleSpeed();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, engine]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      data-testid="pronunciation-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-target-word"
        tabIndex={-1}
        className="relative w-full max-w-lg p-6 bg-white border border-neutral-200 rounded-3xl shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-150 outline-hidden"
        data-testid="pronunciation-modal-content"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 font-mono">
              Oral Pronunciation Studio
            </span>
            <h2
              id="modal-target-word"
              className="text-2xl font-bold font-heading text-black tracking-tight"
            >
              {targetWord}
            </h2>
            {meaning && (
              <p className="text-xs text-neutral-500 line-clamp-1">{meaning}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            data-testid="modal-close-button"
            className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-all duration-150 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Accent Audio Selector */}
        <AccentAudioSelector
          activeAccent={engine.accent}
          playbackSpeed={engine.playbackSpeed}
          isPlaying={engine.isAudioPlaying}
          onSelectAccent={engine.setAccent}
          onToggleSpeed={engine.toggleSpeed}
          onPlayAudio={() => engine.playNativeAudio()}
        />

        {/* Phonetic Syllable Breakdown */}
        <PhoneticWordBreakdown
          phonetic={phonetic}
          diffSpans={engine.result?.diffSpans}
          onPlaySyllable={(syl) => engine.playSyllable(syl)}
        />

        {/* Microphone / Recording Central Stage */}
        <div className="flex flex-col items-center justify-center p-6 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-4">
          {engine.state === "PERMISSION_DENIED" ? (
            <MicPermissionBanner
              status="denied"
              onRetry={() => engine.startPractice()}
            />
          ) : engine.state === "ERROR" &&
            engine.error?.includes("not supported") ? (
            <MicPermissionBanner status="unsupported" />
          ) : engine.state === "LISTENING" ? (
            <div className="flex flex-col items-center space-y-3">
              <AcousticSoundwave
                bars={engine.bars}
                isListening={true}
                barCount={5}
              />
              <button
                type="button"
                onClick={engine.stopPractice}
                data-testid="stop-recording-button"
                className="px-6 py-2 rounded-full bg-red-600 text-white font-medium text-sm hover:bg-red-700 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                Stop Speaking
              </button>
              {engine.interimTranscript && (
                <p
                  className="text-xs font-mono text-purple-700 italic animate-pulse"
                  data-testid="interim-transcript"
                >
                  "{engine.interimTranscript}"
                </p>
              )}
            </div>
          ) : engine.state === "PROCESSING" ? (
            <div className="flex flex-col items-center space-y-2 py-4">
              <span className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
              <p className="text-xs text-neutral-500 font-medium">
                Evaluating pronunciation...
              </p>
            </div>
          ) : engine.state === "EVALUATED" && engine.result ? (
            <div className="flex flex-col items-center space-y-4 w-full">
              <PronunciationScoreBadge
                score={engine.result.accuracyScore}
                tier={engine.result.tier}
                xpAwarded={engine.result.xpAwarded}
                isDailyCapped={engine.result.isDailyCapped}
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={engine.retry}
                  data-testid="try-again-button"
                  className="px-5 py-2 rounded-full border border-neutral-300 bg-white text-black font-semibold text-xs hover:border-black active:scale-95 transition-all cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  data-testid="continue-button"
                  className="px-6 py-2 rounded-full bg-black text-white font-semibold text-xs hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <button
                type="button"
                onClick={() => engine.startPractice()}
                data-testid="start-recording-button"
                aria-label="Start recording pronunciation"
                className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
              <span className="text-xs text-neutral-500 font-medium">
                Tap to speak or press{" "}
                <kbd className="px-1.5 py-0.5 text-[10px] bg-neutral-200 rounded border border-neutral-300 font-mono">
                  Space
                </kbd>
              </span>
            </div>
          )}
        </div>

        {/* Live Accessibility Status Announcement */}
        <div
          role="status"
          aria-live="polite"
          className="sr-only"
          data-testid="sr-status-announcement"
        >
          {engine.state === "LISTENING"
            ? "Microphone is recording. Speak the target word now."
            : engine.state === "EVALUATED" && engine.result
              ? `Pronunciation evaluated: ${engine.result.accuracyScore}% score. Tier: ${engine.result.tier}.`
              : ""}
        </div>
      </div>
    </div>
  );
}
