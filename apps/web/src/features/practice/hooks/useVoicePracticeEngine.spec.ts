import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVoicePracticeEngine } from "./useVoicePracticeEngine";
import { practiceService } from "../services/practiceService";

class MockSpeechRecognition {
  continuous = false;
  interimResults = true;
  lang = "en-US";
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onend: (() => void) | null = null;

  start = vi.fn();
  stop = vi.fn(() => this.onend?.());
  abort = vi.fn();
}

class MockAudioContext {
  state = "running";
  currentTime = 0;
  createAnalyser = vi.fn(() => ({
    fftSize: 64,
    smoothingTimeConstant: 0.8,
    frequencyBinCount: 32,
    getByteFrequencyData: vi.fn(),
    disconnect: vi.fn(),
  }));
  createMediaStreamSource = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));
  createOscillator = vi.fn(() => ({
    type: "sine",
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  createGain = vi.fn(() => ({
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  }));
  destination = {};
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
}

describe("useVoicePracticeEngine hook", () => {
  beforeEach(() => {
    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition =
      MockSpeechRecognition;
    (window as unknown as { AudioContext: unknown }).AudioContext =
      MockAudioContext;

    vi.spyOn(practiceService, "submitVoicePronunciation").mockResolvedValue({
      success: true,
      data: {
        isPassed: true,
        accuracyScore: 100,
        tier: "EXACT",
        xpAwarded: 10,
        isDailyCapped: false,
        streakAdvanced: true,
        diffSpans: [],
      },
      message: "Success",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("initializes in IDLE state with default values", () => {
    const { result } = renderHook(() =>
      useVoicePracticeEngine({
        cardId: "test-card-1",
        targetWord: "eloquent",
      }),
    );

    expect(result.current.state).toBe("IDLE");
    expect(result.current.result).toBeNull();
    expect(result.current.accent).toBe("en-US");
    expect(result.current.playbackSpeed).toBe(1.0);
  });

  it("transitions to LISTENING when startPractice is triggered", async () => {
    const { result } = renderHook(() =>
      useVoicePracticeEngine({
        cardId: "test-card-1",
        targetWord: "eloquent",
      }),
    );

    await act(async () => {
      await result.current.startPractice();
    });

    expect(result.current.state).toBe("LISTENING");
  });

  it("resets state when retry is called", () => {
    const { result } = renderHook(() =>
      useVoicePracticeEngine({
        cardId: "test-card-1",
        targetWord: "eloquent",
      }),
    );

    act(() => {
      result.current.retry();
    });

    expect(result.current.state).toBe("IDLE");
    expect(result.current.result).toBeNull();
  });
});
