import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioVisualizer } from "./useAudioVisualizer";

class MockAnalyserNode {
  fftSize = 64;
  smoothingTimeConstant = 0.8;
  frequencyBinCount = 32;
  getByteFrequencyData = vi.fn((array: Uint8Array) => {
    array.fill(128); // 50% energy
  });
  disconnect = vi.fn();
}

class MockAudioContext {
  state = "running";
  createAnalyser = vi.fn(() => new MockAnalyserNode());
  createMediaStreamSource = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
}

describe("useAudioVisualizer hook", () => {
  beforeEach(() => {
    (window as unknown as { AudioContext: unknown }).AudioContext =
      MockAudioContext;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default zero bars and zero volume", () => {
    const { result } = renderHook(() => useAudioVisualizer({ barCount: 5 }));

    expect(result.current.bars).toEqual([0, 0, 0, 0, 0]);
    expect(result.current.volume).toBe(0);
    expect(result.current.isSampling).toBe(false);
  });

  it("starts and stops sampling properly with provided stream", async () => {
    const mockTrack = { stop: vi.fn() };
    const mockStream = {
      getTracks: () => [mockTrack],
    } as unknown as MediaStream;

    const { result } = renderHook(() => useAudioVisualizer({ barCount: 5 }));

    await act(async () => {
      await result.current.startSampling(mockStream);
    });

    expect(result.current.isSampling).toBe(true);

    act(() => {
      result.current.stopSampling();
    });

    expect(result.current.isSampling).toBe(false);
    expect(result.current.bars).toEqual([0, 0, 0, 0, 0]);
  });
});
