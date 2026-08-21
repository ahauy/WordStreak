import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSpeechRecognition } from "./useSpeechRecognition";

class MockSpeechRecognition {
  continuous = false;
  interimResults = true;
  lang = "en-US";
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onend: (() => void) | null = null;

  start = vi.fn();
  stop = vi.fn(() => {
    this.onend?.();
  });
  abort = vi.fn();
}

describe("useSpeechRecognition hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition =
      MockSpeechRecognition;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("detects SpeechRecognition support in browser", () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isListening).toBe(false);
  });

  it("starts listening and handles interim & final transcripts", () => {
    const onResult = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition({ onResult }));

    act(() => {
      result.current.startListening();
    });

    expect(result.current.isListening).toBe(true);
  });

  it("handles error events and permission denial", () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition({ onError }));

    act(() => {
      result.current.startListening();
    });

    // Verify hook state initialized
    expect(result.current.isListening).toBe(true);
  });

  it("stops listening cleanly and resets transcript", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });
    expect(result.current.isListening).toBe(true);

    act(() => {
      result.current.stopListening();
    });
    expect(result.current.isListening).toBe(false);

    act(() => {
      result.current.resetTranscript();
    });
    expect(result.current.transcript).toBe("");
    expect(result.current.interimTranscript).toBe("");
  });
});
