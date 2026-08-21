import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioPlayer } from "./useAudioPlayer";

describe("useAudioPlayer Hook", () => {
  let mockAudioInstance: {
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    currentTime: number;
    playbackRate: number;
    src: string;
    onended: (() => void) | null;
    onerror: (() => void) | null;
  };

  let mockSpeechSynthesis: {
    speak: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
    paused: boolean;
    speaking: boolean;
  };

  beforeEach(() => {
    mockAudioInstance = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      currentTime: 0,
      playbackRate: 1.0,
      src: "",
      onended: null,
      onerror: null,
    };

    function MockAudio(src?: string) {
      mockAudioInstance.src = src || "";
      return mockAudioInstance;
    }
    vi.stubGlobal("Audio", MockAudio);

    mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      paused: false,
      speaking: false,
    };

    vi.stubGlobal("speechSynthesis", mockSpeechSynthesis);
    class MockSpeechSynthesisUtterance {
      text: string;
      lang = "en-US";
      rate = 1.0;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("TC-LISTEN-003: HTML5 Audio Playback and Rate Controls (1.0x / 0.75x)", () => {
    it("plays remote audio with default 1.0x rate", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.playAudio(
          "phenomenon",
          "https://cdn.wordstreak.com/audio/phenomenon.mp3",
        );
      });

      expect(mockAudioInstance.src).toBe(
        "https://cdn.wordstreak.com/audio/phenomenon.mp3",
      );
      expect(mockAudioInstance.play).toHaveBeenCalled();
      expect(result.current.isPlaying).toBe(true);
      expect(result.current.playbackSpeed).toBe(1.0);
      expect(result.current.audioSourceType).toBe("REMOTE_MP3");
    });

    it("changes playback rate to 0.75x and toggles back to 1.0x", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.setSpeed(0.75);
      });

      expect(result.current.playbackSpeed).toBe(0.75);

      await act(async () => {
        await result.current.playAudio(
          "phenomenon",
          "https://cdn.wordstreak.com/audio/phenomenon.mp3",
        );
      });

      expect(mockAudioInstance.playbackRate).toBe(0.75);

      act(() => {
        result.current.toggleSpeed();
      });

      expect(result.current.playbackSpeed).toBe(1.0);
    });

    it("resets currentTime and plays again on replayAudio", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.playAudio(
          "phenomenon",
          "https://cdn.wordstreak.com/audio/phenomenon.mp3",
        );
      });

      mockAudioInstance.currentTime = 2.5;

      await act(async () => {
        await result.current.replayAudio();
      });

      expect(mockAudioInstance.play).toHaveBeenCalledTimes(2);
    });

    it("updates isPlaying to false when audio ends", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.playAudio(
          "phenomenon",
          "https://cdn.wordstreak.com/audio/phenomenon.mp3",
        );
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        if (mockAudioInstance.onended) {
          mockAudioInstance.onended();
        }
      });

      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe("TC-LISTEN-004: Automatic Web Speech API Failover Cascade", () => {
    it("falls back to window.speechSynthesis when audioUrl is null", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.playAudio("perseverance", null);
      });

      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      expect(result.current.audioSourceType).toBe("WEB_SPEECH_TTS");
      expect(result.current.isFallbackTTS).toBe(true);
    });

    it("falls back to window.speechSynthesis when remote audio fails", async () => {
      mockAudioInstance.play = vi
        .fn()
        .mockRejectedValue(new Error("NetworkError"));

      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.playAudio(
          "broken",
          "https://broken-cdn.com/missing.mp3",
        );
      });

      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      expect(result.current.audioSourceType).toBe("WEB_SPEECH_TTS");
    });
  });

  describe("TC-LISTEN-005: Browser Autoplay Restriction Detection & User Gesture Unlock", () => {
    it("sets needsUserGesture to true when play rejects with NotAllowedError", async () => {
      const notAllowedErr = new Error("Autoplay not allowed");
      notAllowedErr.name = "NotAllowedError";
      mockAudioInstance.play = vi.fn().mockRejectedValue(notAllowedErr);

      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.playAudio(
          "phenomenon",
          "https://cdn.wordstreak.com/audio/phenomenon.mp3",
        );
      });

      expect(result.current.needsUserGesture).toBe(true);
      expect(result.current.isPlaying).toBe(false);
    });

    it("un Foreign unlocks user gesture on unlockAudio", async () => {
      const notAllowedErr = new Error("Autoplay not allowed");
      notAllowedErr.name = "NotAllowedError";
      mockAudioInstance.play = vi.fn().mockRejectedValueOnce(notAllowedErr);

      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.playAudio(
          "phenomenon",
          "https://cdn.wordstreak.com/audio/phenomenon.mp3",
        );
      });

      expect(result.current.needsUserGesture).toBe(true);

      mockAudioInstance.play = vi.fn().mockResolvedValue(undefined);

      await act(async () => {
        await result.current.unlockAudio();
      });

      expect(result.current.needsUserGesture).toBe(false);
      expect(result.current.isPlaying).toBe(true);
    });
  });
});
