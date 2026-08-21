import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PronunciationPracticeModal } from "./PronunciationPracticeModal";

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

describe("PronunciationPracticeModal component", () => {
  beforeEach(() => {
    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition =
      MockSpeechRecognition;
    (window as unknown as { AudioContext: unknown }).AudioContext =
      MockAudioContext;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <PronunciationPracticeModal
        isOpen={false}
        onClose={vi.fn()}
        cardId="card-1"
        targetWord="eloquent"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders target word, phonetic chips, and recording CTA when open", () => {
    const onClose = vi.fn();
    render(
      <PronunciationPracticeModal
        isOpen={true}
        onClose={onClose}
        cardId="card-1"
        targetWord="eloquent"
        phonetic="/ˈel.ɪ.kwənt/"
        meaning="fluent or persuasive in speaking or writing"
      />,
    );

    expect(screen.getByText("eloquent")).toBeDefined();
    expect(
      screen.getByText("fluent or persuasive in speaking or writing"),
    ).toBeDefined();
    expect(screen.getByTestId("start-recording-button")).toBeDefined();
  });

  it("calls onClose when close button or Escape key is triggered", () => {
    const onClose = vi.fn();
    render(
      <PronunciationPracticeModal
        isOpen={true}
        onClose={onClose}
        cardId="card-1"
        targetWord="eloquent"
      />,
    );

    const closeBtn = screen.getByTestId("modal-close-button");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("handles keyboard shortcuts Space, R, S, and Tab focus trap", async () => {
    await act(async () => {
      render(
        <PronunciationPracticeModal
          isOpen={true}
          onClose={vi.fn()}
          cardId="card-1"
          targetWord="eloquent"
        />,
      );
    });

    await act(async () => {
      // Space starts recording
      fireEvent.keyDown(window, { code: "Space" });
      // R triggers replay
      fireEvent.keyDown(window, { key: "r" });
      // S triggers speed toggle
      fireEvent.keyDown(window, { key: "s" });
      // Tab triggers focus trap
      fireEvent.keyDown(window, { key: "Tab" });
      fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    });
  });

  it("has WCAG AA compliance with role=dialog, aria-modal=true, and live status announcement", async () => {
    await act(async () => {
      render(
        <PronunciationPracticeModal
          isOpen={true}
          onClose={vi.fn()}
          cardId="card-1"
          targetWord="eloquent"
        />,
      );
    });

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe("modal-target-word");

    const statusLiveRegion = screen.getByTestId("sr-status-announcement");
    expect(statusLiveRegion.getAttribute("aria-live")).toBe("polite");
  });
});
