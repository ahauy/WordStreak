import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioSynthesizer } from "./useAudioSynthesizer";

class MockSpeechSynthesisUtterance {
  text: string;
  lang = "en-US";
  rate = 1.0;
  voice: unknown = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe("useAudioSynthesizer hook", () => {
  beforeEach(() => {
    (
      window as unknown as { SpeechSynthesisUtterance: unknown }
    ).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

    (window as unknown as { speechSynthesis: unknown }).speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn((utterance: MockSpeechSynthesisUtterance) => {
        utterance.onstart?.();
        setTimeout(() => utterance.onend?.(), 10);
      }),
      getVoices: vi.fn(() => [
        { lang: "en-US", name: "US Voice" },
        { lang: "en-GB", name: "UK Voice" },
      ]),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default US accent and 1.0x speed", () => {
    const { result } = renderHook(() => useAudioSynthesizer());
    expect(result.current.activeAccent).toBe("en-US");
    expect(result.current.playbackSpeed).toBe(1.0);
    expect(result.current.isPlaying).toBe(false);
  });

  it("toggles playback speed between 1.0x and 0.75x", () => {
    const { result } = renderHook(() => useAudioSynthesizer());

    act(() => {
      result.current.togglePlaybackSpeed();
    });
    expect(result.current.playbackSpeed).toBe(0.75);

    act(() => {
      result.current.togglePlaybackSpeed();
    });
    expect(result.current.playbackSpeed).toBe(1.0);
  });

  it("changes active accent cleanly", () => {
    const { result } = renderHook(() => useAudioSynthesizer());

    act(() => {
      result.current.setActiveAccent("en-GB");
    });
    expect(result.current.activeAccent).toBe("en-GB");
  });

  it("falls back to window.speechSynthesis when no audio URL is provided", async () => {
    const { result } = renderHook(() => useAudioSynthesizer());

    await act(async () => {
      await result.current.playWord("eloquent", null, "en-US", 1.0);
    });

    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });
});
