import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useFillBlankQuiz } from "./useFillBlankQuiz";
import type { FillBlankQuestionDto } from "@wordstreak/shared-types";

describe("useFillBlankQuiz", () => {
  const mockQuestions: FillBlankQuestionDto[] = [
    {
      id: "fb-1",
      cardId: "c1",
      sentenceWithBlank:
        "The scientist made an important [ _____ ] in genetics.",
      sentencePrefix: "The scientist made an important ",
      sentenceSuffix: " in genetics.",
      targetWord: "discovery",
      targetInflection: "discovery",
      meaning: "sự khám phá, phát hiện",
      phonetic: "/dɪˈskʌv.ər.i/",
      scrambledLetters: ["y", "r", "e", "v", "o", "c", "s", "i", "d"],
      wordLength: 9,
    },
    {
      id: "fb-2",
      cardId: "c2",
      sentenceWithBlank: "The company [ _____ ] three startups.",
      sentencePrefix: "The company ",
      sentenceSuffix: " three startups.",
      targetWord: "acquire",
      targetInflection: "acquired",
      meaning: "thu được, mua lại",
      phonetic: "/əˈkwaɪər/",
      scrambledLetters: ["d", "e", "r", "i", "u", "q", "c", "a"],
      wordLength: 8,
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
      useFillBlankQuiz({
        questions: mockQuestions,
        deckId: "deck-1",
        isZenMode: true,
      }),
    );

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentQuestion?.id).toBe("fb-1");
    expect(result.current.feedbackState).toBe("IDLE");
    expect(result.current.currentCombo).toBe(0);
    expect(result.current.typedInput).toBe("");
  });

  it("should validate correct answer case-insensitively and auto-advance (TC-005)", () => {
    const { result } = renderHook(() =>
      useFillBlankQuiz({
        questions: mockQuestions,
        deckId: "deck-1",
        isZenMode: true,
      }),
    );

    act(() => {
      result.current.setTypedInput("DISCOVERY");
    });

    act(() => {
      result.current.submitAnswer();
    });

    expect(result.current.feedbackState).toBe("CORRECT");
    expect(result.current.currentCombo).toBe(1);

    // Advance timer by 1200ms
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.feedbackState).toBe("IDLE");
    expect(result.current.currentQuestion?.id).toBe("fb-2");
    expect(result.current.typedInput).toBe("");
  });

  it("should accept inflected form or base form (TC-005)", () => {
    const { result } = renderHook(() =>
      useFillBlankQuiz({
        questions: mockQuestions,
        deckId: "deck-1",
        isZenMode: true,
      }),
    );

    // Advance to question 2
    act(() => {
      result.current.submitAnswer("discovery");
      vi.advanceTimersByTime(1200);
    });

    expect(result.current.currentIndex).toBe(1);

    // Submit base form "acquire" for inflected "acquired"
    act(() => {
      result.current.submitAnswer("acquire");
    });

    expect(result.current.feedbackState).toBe("CORRECT");
  });

  it("should reveal first letter when hint is triggered (TC-006)", () => {
    const { result } = renderHook(() =>
      useFillBlankQuiz({
        questions: mockQuestions,
        deckId: "deck-1",
        isZenMode: true,
      }),
    );

    expect(result.current.hintLevel).toBe(0);
    expect(result.current.typedInput).toBe("");

    act(() => {
      result.current.triggerHint();
    });

    expect(result.current.hintLevel).toBe(1);
    expect(result.current.typedInput).toBe("d"); // First letter of "discovery"
  });

  it("should handle anagram tile clicks and selection", () => {
    const { result } = renderHook(() =>
      useFillBlankQuiz({
        questions: mockQuestions,
        deckId: "deck-1",
        isZenMode: true,
      }),
    );

    act(() => {
      result.current.selectAnagramTile(0);
    });

    expect(result.current.selectedTileIndices).toEqual([0]);
    expect(result.current.typedInput).toBe("y");

    act(() => {
      result.current.removeLastAnagramTile();
    });

    expect(result.current.selectedTileIndices).toEqual([]);
    expect(result.current.typedInput).toBe("");
  });
});
