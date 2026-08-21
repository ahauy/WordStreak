import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useListeningQuiz } from "./useListeningQuiz";
import { practiceService } from "../services/practiceService";
import type { ListeningQuestionDto } from "@wordstreak/shared-types";

vi.mock("../services/practiceService", () => ({
  practiceService: {
    submitQuiz: vi.fn().mockResolvedValue({
      totalQuestions: 2,
      correctCount: 2,
      accuracyPercentage: 100,
      totalXpEarned: 50,
      maxCombo: 2,
      missedCards: [],
    }),
  },
}));

describe("useListeningQuiz Hook", () => {
  const mockQuestions: ListeningQuestionDto[] = [
    {
      id: "lq_1",
      cardId: "card_1",
      word: "efficient",
      meaning: "hiệu quả",
      phonetic: "/ɪˈfɪʃ.ənt/",
      audioUrl: "https://cdn.wordstreak.com/audio/efficient.mp3",
      wordLength: 9,
      firstLetterHint: "e",
    },
    {
      id: "lq_2",
      cardId: "card_2",
      word: "perseverance",
      meaning: "sự kiên trì",
      phonetic: "/ˌpɜː.sɪˈvɪə.rəns/",
      audioUrl: null,
      wordLength: 12,
      firstLetterHint: "p",
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    function MockAudio() {
      return {
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        currentTime: 0,
        playbackRate: 1.0,
        src: "",
        onended: null,
        onerror: null,
      };
    }
    vi.stubGlobal("Audio", MockAudio);
    vi.stubGlobal("speechSynthesis", {
      speak: vi.fn(),
      cancel: vi.fn(),
    });
    class MockUtterance {
      text: string;
      lang = "en-US";
      rate = 1.0;
      constructor(text: string) {
        this.text = text;
      }
    }
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("TC-LISTEN-010: State Machine & Auto-Advance", () => {
    it("initializes with first question and IDLE state", () => {
      const { result } = renderHook(() =>
        useListeningQuiz({
          questions: mockQuestions,
          deckId: "deck_1",
          isZenMode: false,
        }),
      );

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.currentQuestion?.word).toBe("efficient");
      expect(result.current.feedbackState).toBe("IDLE");
      expect(result.current.typedInput).toBe("");
      expect(result.current.currentCombo).toBe(0);
      expect(result.current.isCompleted).toBe(false);
    });

    it("evaluates correct answer, sets CORRECT state, increments combo, and auto-advances after 1200ms", async () => {
      const { result } = renderHook(() =>
        useListeningQuiz({
          questions: mockQuestions,
          deckId: "deck_1",
          isZenMode: true,
        }),
      );

      act(() => {
        result.current.setTypedInput("efficient");
      });

      await act(async () => {
        await result.current.submitAnswer();
      });

      expect(result.current.feedbackState).toBe("CORRECT");
      expect(result.current.currentCombo).toBe(1);

      // Advance timer by 1200ms
      act(() => {
        vi.advanceTimersByTime(1200);
      });

      expect(result.current.currentIndex).toBe(1);
      expect(result.current.currentQuestion?.word).toBe("perseverance");
      expect(result.current.feedbackState).toBe("IDLE");
      expect(result.current.typedInput).toBe("");
    });

    it("skips 1200ms delay immediately when skipToNext is called", async () => {
      const { result } = renderHook(() =>
        useListeningQuiz({
          questions: mockQuestions,
          deckId: "deck_1",
          isZenMode: true,
        }),
      );

      act(() => {
        result.current.setTypedInput("efficient");
      });

      await act(async () => {
        await result.current.submitAnswer();
      });

      expect(result.current.feedbackState).toBe("CORRECT");

      act(() => {
        result.current.skipToNext();
      });

      expect(result.current.currentIndex).toBe(1);
      expect(result.current.feedbackState).toBe("IDLE");
    });
  });

  describe("TC-LISTEN-011: 3-Tier Progressive Hint Engine & Bonus Forfeiture", () => {
    it("progresses hint level from 0 to 3 and marks speed bonus ineligible", () => {
      const { result } = renderHook(() =>
        useListeningQuiz({
          questions: mockQuestions,
          deckId: "deck_1",
          isZenMode: true,
        }),
      );

      expect(result.current.hintLevel).toBe(0);
      expect(result.current.isSpeedBonusEligible).toBe(true);

      act(() => {
        result.current.triggerHint();
      });
      expect(result.current.hintLevel).toBe(1);
      expect(result.current.isSpeedBonusEligible).toBe(false);

      act(() => {
        result.current.triggerHint();
      });
      expect(result.current.hintLevel).toBe(2);

      act(() => {
        result.current.triggerHint();
      });
      expect(result.current.hintLevel).toBe(3);

      // Fourth trigger should remain at 3
      act(() => {
        result.current.triggerHint();
      });
      expect(result.current.hintLevel).toBe(3);
    });
  });

  describe("TC-LISTEN-014: 20-Second Countdown Timer & Zen Mode", () => {
    it("expires timer after 20s and marks answer incorrect", () => {
      const { result } = renderHook(() =>
        useListeningQuiz({
          questions: mockQuestions,
          deckId: "deck_1",
          isZenMode: false,
        }),
      );

      expect(result.current.timerSeconds).toBe(20);

      act(() => {
        vi.advanceTimersByTime(20000);
      });

      expect(result.current.feedbackState).toBe("INCORRECT");
      expect(result.current.currentCombo).toBe(0);
    });

    it("does not count down in Zen Mode", () => {
      const { result } = renderHook(() =>
        useListeningQuiz({
          questions: mockQuestions,
          deckId: "deck_1",
          isZenMode: true,
        }),
      );

      act(() => {
        vi.advanceTimersByTime(25000);
      });

      expect(result.current.feedbackState).toBe("IDLE");
    });
  });

  describe("Completion and Results", () => {
    it("completes quiz after last question and calls practiceService.submitQuiz", async () => {
      const onSessionComplete = vi.fn();
      const { result } = renderHook(() =>
        useListeningQuiz({
          questions: mockQuestions,
          deckId: "deck_1",
          isZenMode: true,
          onSessionComplete,
        }),
      );

      // Question 1
      act(() => {
        result.current.setTypedInput("efficient");
      });
      await act(async () => {
        await result.current.submitAnswer();
      });
      act(() => {
        result.current.skipToNext();
      });

      // Question 2
      act(() => {
        result.current.setTypedInput("perseverance");
      });
      await act(async () => {
        await result.current.submitAnswer();
      });
      await act(async () => {
        result.current.skipToNext();
      });

      expect(result.current.isCompleted).toBe(true);
      expect(practiceService.submitQuiz).toHaveBeenCalled();
    });
  });
});
