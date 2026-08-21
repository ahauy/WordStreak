import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useWebAudioSynthesizer } from "./useWebAudioSynthesizer";

describe("useWebAudioSynthesizer", () => {
  let mockAudioContext: {
    currentTime: number;
    state: string;
    resume: ReturnType<typeof vi.fn>;
    createGain: ReturnType<typeof vi.fn>;
    createOscillator: ReturnType<typeof vi.fn>;
    destination: Record<string, unknown>;
    close: ReturnType<typeof vi.fn>;
  };
  let mockGainNode: {
    gain: {
      value: number;
      setValueAtTime: ReturnType<typeof vi.fn>;
      linearRampToValueAtTime: ReturnType<typeof vi.fn>;
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
    connect: ReturnType<typeof vi.fn>;
  };
  let mockOscillatorNode: {
    type: string;
    frequency: {
      value: number;
      setValueAtTime: ReturnType<typeof vi.fn>;
      linearRampToValueAtTime: ReturnType<typeof vi.fn>;
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
    connect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    mockGainNode = {
      gain: {
        value: 0.25,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockOscillatorNode = {
      type: "sine",
      frequency: {
        value: 440,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockAudioContext = {
      currentTime: 0,
      state: "running",
      resume: vi.fn().mockResolvedValue(undefined),
      createGain: vi.fn().mockReturnValue(mockGainNode),
      createOscillator: vi.fn().mockReturnValue(mockOscillatorNode),
      destination: {},
      close: vi.fn().mockResolvedValue(undefined),
    };

    // Use regular function constructor for new AudioContext()
    function MockAudioContextConstructor() {
      return mockAudioContext;
    }
    // @ts-expect-error Mock window AudioContext
    window.AudioContext = vi.fn(MockAudioContextConstructor);
  });

  afterEach(() => {
    // @ts-expect-error Clean up
    delete window.AudioContext;
  });

  it("initializes with unmuted state by default and creates AudioContext lazily", () => {
    const { result } = renderHook(() => useWebAudioSynthesizer());
    expect(result.current.isMuted).toBe(false);
  });

  it("reads muted state from localStorage if present", () => {
    localStorage.setItem("wordstreak_matching_muted", "true");
    const { result } = renderHook(() => useWebAudioSynthesizer());
    expect(result.current.isMuted).toBe(true);
  });

  it("toggles mute state and saves to localStorage", () => {
    const { result } = renderHook(() => useWebAudioSynthesizer());
    expect(result.current.isMuted).toBe(false);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);
    expect(localStorage.getItem("wordstreak_matching_muted")).toBe("true");

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(false);
    expect(localStorage.getItem("wordstreak_matching_muted")).toBe("false");
  });

  it("plays success chime with frequency sweep from ~587Hz to ~880Hz when not muted", () => {
    const { result } = renderHook(() => useWebAudioSynthesizer());

    act(() => {
      result.current.playSuccessChime();
    });

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockOscillatorNode.frequency.setValueAtTime).toHaveBeenCalledWith(
      587.33,
      0,
    );
    expect(
      mockOscillatorNode.frequency.exponentialRampToValueAtTime,
    ).toHaveBeenCalledWith(880.0, 0.12);
    expect(mockOscillatorNode.start).toHaveBeenCalled();
    expect(mockOscillatorNode.stop).toHaveBeenCalled();
  });

  it("plays mismatch buzz with sawtooth wave descending from 180Hz to 120Hz", () => {
    const { result } = renderHook(() => useWebAudioSynthesizer());

    act(() => {
      result.current.playMismatchBuzz();
    });

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockOscillatorNode.type).toBe("sawtooth");
    expect(mockOscillatorNode.frequency.setValueAtTime).toHaveBeenCalledWith(
      180,
      0,
    );
    expect(
      mockOscillatorNode.frequency.linearRampToValueAtTime,
    ).toHaveBeenCalledWith(120, 0.18);
    expect(mockOscillatorNode.start).toHaveBeenCalled();
    expect(mockOscillatorNode.stop).toHaveBeenCalled();
  });

  it("plays combo ding with high frequency bell tone ~1046.5Hz", () => {
    const { result } = renderHook(() => useWebAudioSynthesizer());

    act(() => {
      result.current.playComboDing(5);
    });

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockOscillatorNode.type).toBe("sine");
    expect(mockOscillatorNode.frequency.setValueAtTime).toHaveBeenCalledWith(
      1046.5,
      0,
    );
    expect(mockOscillatorNode.start).toHaveBeenCalled();
  });

  it("does not synthesize or play any audio when muted", () => {
    localStorage.setItem("wordstreak_matching_muted", "true");
    const { result } = renderHook(() => useWebAudioSynthesizer());

    act(() => {
      result.current.playSuccessChime();
      result.current.playMismatchBuzz();
      result.current.playComboDing();
    });

    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    expect(mockAudioContext.createGain).not.toHaveBeenCalled();
  });

  it("resumes AudioContext if suspended on audio trigger", () => {
    mockAudioContext.state = "suspended";
    const { result } = renderHook(() => useWebAudioSynthesizer());

    act(() => {
      result.current.playSuccessChime();
    });

    expect(mockAudioContext.resume).toHaveBeenCalled();
  });
});
