// @vitest-environment jsdom
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MicroReviewBanner } from "../MicroReviewBanner";
import { MicroCard, playCardAudio } from "../MicroCard";
import { MicroReviewSession } from "../MicroReviewSession";
import { SrsRating } from "@wordstreak/shared-types";
import type { DueCardItem } from "@wordstreak/shared-types";

describe("MicroReviewSession & Subcomponents (TC-MICREV-001 .. TC-MICREV-018)", () => {
  let container: HTMLDivElement;
  let root: Root;

  const sampleCards: DueCardItem[] = [
    {
      id: "card-1",
      cardId: "card-1",
      deckId: "deck-1",
      deckTitle: "Oxford 3000",
      deckColor: "#863bff",
      word: "ubiquitous",
      meaning: "phổ biến khắp nơi",
      phonetic: "/juːˈbɪk.wɪ.təs/",
      audioUrl: "https://audio.example.com/ubiquitous.mp3",
      exampleSentence: "Smartphones have become ubiquitous in daily life.",
      status: "LEARNING",
      interval: 1,
      repetitions: 1,
      easeFactor: 2.5,
      nextReviewDate: "2026-10-14T10:00:00.000Z",
    },
    {
      id: "card-2",
      cardId: "card-2",
      deckId: "deck-1",
      deckTitle: "Oxford 3000",
      deckColor: "#863bff",
      word: "ephemeral",
      meaning: "phù du, chóng tàn",
      phonetic: "/ɪˈfem.ər.əl/",
      audioUrl: null,
      exampleSentence: "Fame in the digital age is often ephemeral.",
      status: "NEW",
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: "2026-10-14T10:00:00.000Z",
    },
    {
      id: "card-3",
      cardId: "card-3",
      deckId: "deck-2",
      deckTitle: "IELTS Core",
      deckColor: "#10b981",
      word: "resilient",
      meaning: "kiên cường, mau hồi phục",
      phonetic: "/rɪˈzɪl.jənt/",
      audioUrl: "https://audio.example.com/resilient.mp3",
      exampleSentence: "The community remained resilient after the storm.",
      status: "LEARNING",
      interval: 3,
      repetitions: 2,
      easeFactor: 2.6,
      nextReviewDate: "2026-10-14T10:00:00.000Z",
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    // Mock chrome runtime and tabs APIs
    (globalThis as any).chrome = {
      runtime: {
        sendMessage: vi.fn(),
      },
      tabs: {
        create: vi.fn(),
      },
    };

    // Mock SpeechSynthesis on window using defineProperty
    const mockSpeech = {
      speak: vi.fn(),
      cancel: vi.fn(),
    };
    Object.defineProperty(window, "speechSynthesis", {
      writable: true,
      configurable: true,
      value: mockSpeech,
    });
    const mockUtterance = vi.fn().mockImplementation(function (this: any, text: string) {
      this.text = text;
      this.lang = "en-US";
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      writable: true,
      configurable: true,
      value: mockUtterance,
    });
    (globalThis as any).SpeechSynthesisUtterance = mockUtterance;

    // Mock Audio on window using defineProperty
    const defaultAudio = vi.fn().mockImplementation(function (this: any, src: string) {
      this.src = src;
      this.play = vi.fn().mockResolvedValue(undefined);
      this.onended = null;
      this.onerror = null;
    });
    Object.defineProperty(window, "Audio", {
      writable: true,
      configurable: true,
      value: defaultAudio,
    });
    (globalThis as any).Audio = defaultAudio;
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    delete (globalThis as any).chrome;
  });

  // TC-MICREV-001
  it("TC-MICREV-001: renders banner when dueCount > 0 and user is logged in", async () => {
    await act(async () => {
      root.render(
        <MicroReviewBanner
          dueCount={8}
          isAuthenticated={true}
          onStartReview={() => {}}
        />,
      );
    });

    const banner = container.querySelector("[data-testid='micro-review-banner']");
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain("8 thẻ cần ôn");
    expect(banner?.textContent).toContain("Ôn nhanh 5 thẻ →");
  });

  // TC-MICREV-002
  it("TC-MICREV-002: banner displays custom count when dueCount < 5 (e.g. 3)", async () => {
    await act(async () => {
      root.render(
        <MicroReviewBanner
          dueCount={3}
          isAuthenticated={true}
          onStartReview={() => {}}
        />,
      );
    });

    const banner = container.querySelector("[data-testid='micro-review-banner']");
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain("3 thẻ cần ôn");
    expect(banner?.textContent).toContain("Ôn nhanh 3 thẻ →");
  });

  // TC-MICREV-003
  it("TC-MICREV-003: hides banner when dueCount === 0", async () => {
    await act(async () => {
      root.render(
        <MicroReviewBanner
          dueCount={0}
          isAuthenticated={true}
          onStartReview={() => {}}
        />,
      );
    });

    const banner = container.querySelector("[data-testid='micro-review-banner']");
    expect(banner).toBeNull();
    expect(container.innerHTML).toBe("");
  });

  // TC-MICREV-004
  it("TC-MICREV-004: hides banner when user is unauthenticated", async () => {
    await act(async () => {
      root.render(
        <MicroReviewBanner
          dueCount={12}
          isAuthenticated={false}
          onStartReview={() => {}}
        />,
      );
    });

    const banner = container.querySelector("[data-testid='micro-review-banner']");
    expect(banner).toBeNull();
  });

  // TC-MICREV-005
  it("TC-MICREV-005: click on banner triggers onStartReview callback", async () => {
    const onStartReview = vi.fn();
    await act(async () => {
      root.render(
        <MicroReviewBanner
          dueCount={5}
          isAuthenticated={true}
          onStartReview={onStartReview}
        />,
      );
    });

    const btn = container.querySelector("[data-testid='start-micro-review-btn']") as HTMLButtonElement;
    expect(btn).not.toBeNull();

    act(() => {
      btn.click();
    });

    expect(onStartReview).toHaveBeenCalledTimes(1);
  });

  // TC-MICREV-006
  it("TC-MICREV-006: MicroReviewSession dispatches FETCH_DUE_CARDS on mount and renders card 1", async () => {
    const sendMessageMock = vi.fn().mockImplementation((msg, callback) => {
      if (msg.type === "FETCH_DUE_CARDS") {
        callback({ success: true, data: sampleCards });
      }
    });
    chrome.runtime.sendMessage = sendMessageMock;

    await act(async () => {
      root.render(<MicroReviewSession onExit={() => {}} streak={4} />);
    });

    expect(sendMessageMock).toHaveBeenCalledWith(
      { type: "FETCH_DUE_CARDS", payload: { limit: 5 } },
      expect.any(Function),
    );

    const cardWord = container.querySelector("[data-testid='card-word']");
    expect(cardWord?.textContent).toBe("ubiquitous");
    const progress = container.querySelector("[data-testid='review-progress-text']");
    expect(progress?.textContent).toBe("Thẻ 1/3");
  });

  // TC-MICREV-007
  it("TC-MICREV-007: card flips on click from front face to back face", async () => {
    let flipped = false;
    const onFlip = vi.fn().mockImplementation(() => {
      flipped = !flipped;
    });

    await act(async () => {
      root.render(
        <MicroCard
          card={sampleCards[0]}
          isFlipped={false}
          onFlip={onFlip}
          onRate={() => {}}
        />,
      );
    });

    // On front face: meaning is not shown, flip hint is shown
    expect(container.querySelector("[data-testid='card-front-face']")).not.toBeNull();
    expect(container.querySelector("[data-testid='card-back-face']")).toBeNull();
    expect(container.querySelector("[data-testid='flip-hint']")).not.toBeNull();

    const card = container.querySelector("[data-testid='micro-card']") as HTMLElement;
    act(() => {
      card.click();
    });

    expect(onFlip).toHaveBeenCalledTimes(1);

    // Re-render as flipped
    await act(async () => {
      root.render(
        <MicroCard
          card={sampleCards[0]}
          isFlipped={true}
          onFlip={onFlip}
          onRate={() => {}}
        />,
      );
    });

    expect(container.querySelector("[data-testid='card-back-face']")).not.toBeNull();
    expect(container.querySelector("[data-testid='card-meaning']")?.textContent).toBe("phổ biến khắp nơi");
    expect(container.querySelector("[data-testid='rating-buttons-group']")).not.toBeNull();
  });

  // TC-MICREV-008
  it("TC-MICREV-008: card flips on Space key press", async () => {
    await act(async () => {
      root.render(
        <MicroReviewSession
          initialCards={sampleCards}
          onExit={() => {}}
          streak={3}
        />,
      );
    });

    expect(container.querySelector("[data-testid='card-front-face']")).not.toBeNull();
    expect(container.querySelector("[data-testid='card-back-face']")).toBeNull();

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", key: " " }));
    });

    expect(container.querySelector("[data-testid='card-back-face']")).not.toBeNull();
    expect(container.querySelector("[data-testid='card-meaning']")?.textContent).toBe("phổ biến khắp nơi");
  });

  // TC-MICREV-009
  it("TC-MICREV-009: audio speaker button plays audio when audioUrl is present", async () => {
    const playMock = vi.fn().mockResolvedValue(undefined);
    const audioConstructorMock = vi.fn().mockImplementation(function (this: any, src: string) {
      this.src = src;
      this.play = playMock;
      this.onended = null;
      this.onerror = null;
    });
    Object.defineProperty(window, "Audio", {
      writable: true,
      configurable: true,
      value: audioConstructorMock,
    });
    (globalThis as any).Audio = audioConstructorMock;

    await act(async () => {
      root.render(
        <MicroCard
          card={sampleCards[0]}
          isFlipped={false}
          onFlip={() => {}}
          onRate={() => {}}
        />,
      );
    });

    const audioBtn = container.querySelector("[data-testid='card-audio-btn']") as HTMLButtonElement;
    expect(audioBtn).not.toBeNull();

    act(() => {
      audioBtn.click();
    });

    expect(audioConstructorMock).toHaveBeenCalledWith(sampleCards[0].audioUrl);
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  // TC-MICREV-010
  it("TC-MICREV-010: falls back to Web Speech API when audioUrl is null or fails", async () => {
    // When audioUrl is null
    await act(async () => {
      await playCardAudio("ephemeral", null);
    });

    expect(window.speechSynthesis.speak).toHaveBeenCalled();

    // When audio play throws error
    const failingAudio = vi.fn().mockImplementation(function (this: any, src: string) {
      this.src = src;
      this.play = vi.fn().mockRejectedValue(new Error("Audio load error"));
      this.onended = null;
      this.onerror = null;
    });
    Object.defineProperty(window, "Audio", {
      writable: true,
      configurable: true,
      value: failingAudio,
    });
    (globalThis as any).Audio = failingAudio;

    await act(async () => {
      await playCardAudio("ubiquitous", "https://audio.example.com/broken.mp3");
    });

    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  // TC-MICREV-011
  it("TC-MICREV-011: pressing R or r triggers audio replay on active card", async () => {
    const playMock = vi.fn().mockResolvedValue(undefined);
    const audioConstructorMock = vi.fn().mockImplementation(function (this: any, src: string) {
      this.src = src;
      this.play = playMock;
      this.onended = null;
      this.onerror = null;
    });
    Object.defineProperty(window, "Audio", {
      writable: true,
      configurable: true,
      value: audioConstructorMock,
    });
    (globalThis as any).Audio = audioConstructorMock;

    await act(async () => {
      root.render(
        <MicroReviewSession
          initialCards={sampleCards}
          onExit={() => {}}
        />,
      );
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "r" }));
    });

    expect(audioConstructorMock).toHaveBeenCalledWith(sampleCards[0].audioUrl);
  });

  // TC-MICREV-012
  it("TC-MICREV-012: rating keys 1-4 are ignored when card is on front face", async () => {
    const sendMessageMock = vi.fn();
    chrome.runtime.sendMessage = sendMessageMock;

    await act(async () => {
      root.render(
        <MicroReviewSession
          initialCards={sampleCards}
          onExit={() => {}}
        />,
      );
    });

    // Front face is active
    expect(container.querySelector("[data-testid='card-front-face']")).not.toBeNull();

    // Press rating key '3'
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "3" }));
    });

    // Should NOT submit review
    expect(sendMessageMock).not.toHaveBeenCalled();
    // Should still be on card 1
    expect(container.querySelector("[data-testid='card-word']")?.textContent).toBe("ubiquitous");
  });

  // TC-MICREV-013
  it("TC-MICREV-013: hotkeys are suppressed when focus is inside an input or textarea", async () => {
    const sendMessageMock = vi.fn();
    chrome.runtime.sendMessage = sendMessageMock;

    await act(async () => {
      root.render(
        <div>
          <input type="text" data-testid="test-input" />
          <MicroReviewSession
            initialCards={sampleCards}
            onExit={() => {}}
          />
        </div>,
      );
    });

    const input = container.querySelector("[data-testid='test-input']") as HTMLInputElement;
    input.focus();

    // Press Space inside input
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          code: "Space",
          key: " ",
        }),
      );
    });

    // Card should NOT flip
    expect(container.querySelector("[data-testid='card-front-face']")).not.toBeNull();
    expect(container.querySelector("[data-testid='card-back-face']")).toBeNull();
  });

  // TC-MICREV-014
  it("TC-MICREV-014: clicking rating button or pressing 1-4 on back submits review optimistically", async () => {
    const sendMessageMock = vi.fn();
    chrome.runtime.sendMessage = sendMessageMock;

    await act(async () => {
      root.render(
        <MicroReviewSession
          initialCards={sampleCards}
          onExit={() => {}}
        />,
      );
    });

    // Flip card to back
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", key: " " }));
    });
    expect(container.querySelector("[data-testid='card-back-face']")).not.toBeNull();

    // Rate Good (3) via hotkey
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "3" }));
    });

    // Dispatched SUBMIT_MICRO_REVIEW optimistically
    expect(sendMessageMock).toHaveBeenCalledWith({
      type: "SUBMIT_MICRO_REVIEW",
      payload: { cardId: "card-1", rating: SrsRating.GOOD },
    });

    // Advances to card 2 on front face
    expect(container.querySelector("[data-testid='card-word']")?.textContent).toBe("ephemeral");
    expect(container.querySelector("[data-testid='card-front-face']")).not.toBeNull();
    expect(container.querySelector("[data-testid='review-progress-text']")?.textContent).toBe("Thẻ 2/3");
  });

  // TC-MICREV-015
  it("TC-MICREV-015: progress bar updates width as cards advance", async () => {
    await act(async () => {
      root.render(
        <MicroReviewSession
          initialCards={sampleCards}
          onExit={() => {}}
        />,
      );
    });

    const progressBar = container.querySelector("[data-testid='review-progress-bar']") as HTMLElement;
    expect(progressBar.style.width).toBe("0%");

    // Flip and rate card 1
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", key: " " }));
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "4" }));
    });

    // Advances to card 2: 1/3 = 33.33%
    expect(progressBar.style.width).toContain("33.33");
  });

  // TC-MICREV-016
  it("TC-MICREV-016: clicking ← Quay lại button exits session to home view", async () => {
    const onExit = vi.fn();
    await act(async () => {
      root.render(
        <MicroReviewSession
          initialCards={sampleCards}
          onExit={onExit}
        />,
      );
    });

    const backBtn = container.querySelector("[data-testid='review-back-btn']") as HTMLButtonElement;
    expect(backBtn).not.toBeNull();

    act(() => {
      backBtn.click();
    });

    expect(onExit).toHaveBeenCalledTimes(1);
  });

  // TC-MICREV-017
  it("TC-MICREV-017: displays friendly empty state when 0 cards are returned", async () => {
    const onExit = vi.fn();
    const sendMessageMock = vi.fn().mockImplementation((msg, callback) => {
      if (msg.type === "FETCH_DUE_CARDS") {
        callback({ success: true, data: [] });
      }
    });
    chrome.runtime.sendMessage = sendMessageMock;

    await act(async () => {
      root.render(<MicroReviewSession onExit={onExit} />);
    });

    const empty = container.querySelector("[data-testid='micro-review-empty']");
    expect(empty).not.toBeNull();
    expect(empty?.textContent).toContain("Không còn thẻ nào cần ôn hôm nay");

    const exitBtn = container.querySelector("[data-testid='empty-exit-btn']") as HTMLButtonElement;
    act(() => {
      exitBtn.click();
    });

    expect(onExit).toHaveBeenCalledTimes(1);
  });

  // TC-MICREV-018
  it("TC-MICREV-018: completing all cards renders celebration screen & dispatches REFRESH_BADGE", async () => {
    const onExit = vi.fn();
    const sendMessageMock = vi.fn();
    chrome.runtime.sendMessage = sendMessageMock;

    await act(async () => {
      root.render(
        <MicroReviewSession
          initialCards={[sampleCards[0]]} // Single card session
          onExit={onExit}
          streak={5}
        />,
      );
    });

    // Flip and rate the single card
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", key: " " }));
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "3" }));
    });

    // Should request immediate badge refresh
    expect(sendMessageMock).toHaveBeenCalledWith({
      type: "REFRESH_BADGE",
      payload: { immediate: true },
    });

    // Renders completion celebration screen
    const completion = container.querySelector("[data-testid='micro-review-completion']");
    expect(completion).not.toBeNull();
    expect(container.querySelector("[data-testid='completion-title']")?.textContent).toContain("Hoàn thành");
    expect(container.querySelector("[data-testid='completion-stats']")?.textContent).toContain("1 thẻ");
    expect(container.querySelector("[data-testid='completion-stats']")?.textContent).toContain("5 ngày 🔥");

    // Open web app button
    const openAppBtn = container.querySelector("[data-testid='open-webapp-btn']") as HTMLButtonElement;
    act(() => {
      openAppBtn.click();
    });
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: expect.stringContaining("/dashboard"),
    });

    // Finish button
    const finishBtn = container.querySelector("[data-testid='completion-finish-btn']") as HTMLButtonElement;
    act(() => {
      finishBtn.click();
    });
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
