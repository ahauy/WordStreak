import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useQuizEngine } from "./useQuizEngine";
import type { QuizQuestionDto } from "@wordstreak/shared-types";

describe("useQuizEngine", () => {
  const mockQuestions: QuizQuestionDto[] = [
    {
      id: "q1",
      cardId: "c1",
      format: "EN_TO_VI",
      prompt: "ephemeral",
      options: [
        { id: "opt-1", text: "phù du, chóng tàn", isCorrect: true },
        { id: "opt-2", text: "may mắn", isCorrect: false },
        { id: "opt-3", text: "phổ biến", isCorrect: false },
        { id: "opt-4", text: "lưu loát", isCorrect: false },
      ],
    },
    {
      id: "q2",
      cardId: "c2",
      format: "VI_TO_EN",
      prompt: "sự may mắn tình cờ",
      options: [
        { id: "opt-5", text: "ephemeral", isCorrect: false },
        { id: "opt-6", text: "serendipity", isCorrect: true },
        { id: "opt-7", text: "ubiquitous", isCorrect: false },
        { id: "opt-8", text: "eloquent", isCorrect: false },
      ],
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with first question and idle state", () => {
    const { result } = renderHook(() =>
      useQuizEngine({
        questions: mockQuestions,
        deckId: "deck-1",
        isZenMode: true,
      }),
    );

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentQuestion?.id).toBe("q1");
    expect(result.current.feedbackState).toBe("IDLE");
    expect(result.current.currentCombo).toBe(0);
  });

  it("should evaluate correct option and auto-advance after 1.0s", () => {
    const { result } = renderHook(() =>
      useQuizEngine({
        questions: mockQuestions,
        deckId: "deck-1",
        isZenMode: true,
      }),
    );

    act(() => {
      result.current.selectOption("opt-1"); // Correct answer
    });

    expect(result.current.feedbackState).toBe("CORRECT");
    expect(result.current.currentCombo).toBe(1);
    expect(result.current.selectedOptionId).toBe("opt-1");

    // Advance timer by 1000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.feedbackState).toBe("IDLE");
    expect(result.current.currentQuestion?.id).toBe("q2");
  });

  it("should allow skipping the 1.0s delay with skipFeedback", () => {
    const { result } = renderHook(() =>
      useQuizEngine({
        questions: mockQuestions,
        deckId: "deck-1",
        isZenMode: true,
      }),
    );

    act(() => {
      result.current.selectOption("opt-1");
    });

    expect(result.current.feedbackState).toBe("CORRECT");

    act(() => {
      result.current.skipFeedback();
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.feedbackState).toBe("IDLE");
  });

  it("should handle timeout when 15s timer expires in standard mode", () => {
    const { result } = renderHook(() =>
      useQuizEngine({
        questions: mockQuestions,
        deckId: "deck-1",
        isZenMode: false,
      }),
    );

    expect(result.current.timerSeconds).toBe(15);

    // Advance 15 seconds
    act(() => {
      vi.advanceTimersByTime(15000);
    });

    expect(result.current.feedbackState).toBe("TIMEOUT");
    expect(result.current.currentCombo).toBe(0);

    // Auto advance after 1000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.currentIndex).toBe(1);
  });
});
