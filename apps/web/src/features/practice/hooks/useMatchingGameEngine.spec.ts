import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useMatchingGameEngine } from "./useMatchingGameEngine";
import type { WebAudioSynthesizer } from "./useWebAudioSynthesizer";
import type { MatchingRoundDto } from "@wordstreak/shared-types";
import { practiceService } from "../services/practiceService";

const mockRounds: MatchingRoundDto[] = [
  {
    roundIndex: 0,
    totalRounds: 2,
    wordTiles: [
      { id: "w_1", cardId: "card_1", text: "ubiquitous", type: "WORD" },
      { id: "w_2", cardId: "card_2", text: "ephemeral", type: "WORD" },
      { id: "w_3", cardId: "card_3", text: "serendipity", type: "WORD" },
      { id: "w_4", cardId: "card_4", text: "resilient", type: "WORD" },
      { id: "w_5", cardId: "card_5", text: "tenacious", type: "WORD" },
    ],
    meaningTiles: [
      {
        id: "m_2",
        cardId: "card_2",
        text: "phù du, ngắn ngủi",
        type: "MEANING",
      },
      {
        id: "m_1",
        cardId: "card_1",
        text: "phổ biến khắp nơi",
        type: "MEANING",
      },
      { id: "m_3", cardId: "card_3", text: "may mắn bất ngờ", type: "MEANING" },
      { id: "m_5", cardId: "card_5", text: "kiên trì bền bỉ", type: "MEANING" },
      {
        id: "m_4",
        cardId: "card_4",
        text: "kiên cường phục hồi",
        type: "MEANING",
      },
    ],
  },
  {
    roundIndex: 1,
    totalRounds: 2,
    wordTiles: [
      { id: "w_6", cardId: "card_6", text: "pragmatic", type: "WORD" },
      { id: "w_7", cardId: "card_7", text: "meticulous", type: "WORD" },
      { id: "w_8", cardId: "card_8", text: "eloquent", type: "WORD" },
      { id: "w_9", cardId: "card_9", text: "lucid", type: "WORD" },
      { id: "w_10", cardId: "card_10", text: "candid", type: "WORD" },
    ],
    meaningTiles: [
      { id: "m_7", cardId: "card_7", text: "tỉ mỉ, cẩn thận", type: "MEANING" },
      { id: "m_6", cardId: "card_6", text: "thực tế", type: "MEANING" },
      { id: "m_8", cardId: "card_8", text: "hùng hồn", type: "MEANING" },
      { id: "m_10", cardId: "card_10", text: "thẳng thắn", type: "MEANING" },
      { id: "m_9", cardId: "card_9", text: "rõ ràng", type: "MEANING" },
    ],
  },
];

describe("useMatchingGameEngine", () => {
  let mockSynthesizer: WebAudioSynthesizer;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    mockSynthesizer = {
      isMuted: false,
      toggleMute: vi.fn(),
      setMuted: vi.fn(),
      playSuccessChime: vi.fn(),
      playMismatchBuzz: vi.fn(),
      playComboDing: vi.fn(),
    };

    vi.spyOn(practiceService, "submitMatchingQuiz").mockResolvedValue({
      totalPairs: 10,
      matchedCount: 10,
      accuracyPercentage: 100,
      maxCombo: 10,
      totalTimeMs: 12000,
      totalXpEarned: 35,
      xpBreakdown: {
        baseXp: 20,
        comboBonusXp: 5,
        speedBonusXp: 10,
        perfectBonusXp: 0,
        totalXp: 35,
      },
      missedCards: [],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes in PLAYING state with first round tiles initialized to NEUTRAL", () => {
    const { result } = renderHook(() =>
      useMatchingGameEngine({
        rounds: mockRounds,
        deckId: "deck_123",
        synthesizer: mockSynthesizer,
      }),
    );

    expect(result.current.engineState).toBe("PLAYING");
    expect(result.current.currentRoundIndex).toBe(0);
    expect(result.current.wordTiles).toHaveLength(5);
    expect(result.current.meaningTiles).toHaveLength(5);
    expect(result.current.selectedTileId).toBeNull();
    expect(result.current.tileStates["w_1"]).toBe("NEUTRAL");
    expect(result.current.currentCombo).toBe(0);
  });

  it("transitions to CARD_SELECTED when selecting a first tile", () => {
    const { result } = renderHook(() =>
      useMatchingGameEngine({
        rounds: mockRounds,
        deckId: "deck_123",
        synthesizer: mockSynthesizer,
      }),
    );

    act(() => {
      result.current.handleSelectTile("w_1");
    });

    expect(result.current.engineState).toBe("CARD_SELECTED");
    expect(result.current.selectedTileId).toBe("w_1");
    expect(result.current.tileStates["w_1"]).toBe("SELECTED");
  });

  it("supports self-deselection when clicking the already selected tile", () => {
    const { result } = renderHook(() =>
      useMatchingGameEngine({
        rounds: mockRounds,
        deckId: "deck_123",
        synthesizer: mockSynthesizer,
      }),
    );

    act(() => {
      result.current.handleSelectTile("w_1");
    });
    expect(result.current.selectedTileId).toBe("w_1");

    act(() => {
      result.current.handleSelectTile("w_1");
    });
    expect(result.current.engineState).toBe("PLAYING");
    expect(result.current.selectedTileId).toBeNull();
    expect(result.current.tileStates["w_1"]).toBe("NEUTRAL");
  });

  it("supports same-column switching without error or mismatch penalty", () => {
    const { result } = renderHook(() =>
      useMatchingGameEngine({
        rounds: mockRounds,
        deckId: "deck_123",
        synthesizer: mockSynthesizer,
      }),
    );

    act(() => {
      result.current.handleSelectTile("w_1");
    });
    expect(result.current.selectedTileId).toBe("w_1");

    act(() => {
      result.current.handleSelectTile("w_2");
    });
    expect(result.current.engineState).toBe("CARD_SELECTED");
    expect(result.current.selectedTileId).toBe("w_2");
    expect(result.current.tileStates["w_1"]).toBe("NEUTRAL");
    expect(result.current.tileStates["w_2"]).toBe("SELECTED");
  });

  it("evaluates a correct match (Left -> Right) and triggers success chime & state transitions", () => {
    const { result } = renderHook(() =>
      useMatchingGameEngine({
        rounds: mockRounds,
        deckId: "deck_123",
        synthesizer: mockSynthesizer,
      }),
    );

    act(() => {
      result.current.handleSelectTile("w_1"); // card_1
    });
    act(() => {
      result.current.handleSelectTile("m_1"); // card_1
    });

    expect(result.current.engineState).toBe("MATCH_SUCCESS");
    expect(result.current.tileStates["w_1"]).toBe("MATCHED");
    expect(result.current.tileStates["m_1"]).toBe("MATCHED");
    expect(mockSynthesizer.playSuccessChime).toHaveBeenCalled();
    expect(result.current.currentCombo).toBe(1);

    // Fast-forward success animation delay (300ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.engineState).toBe("PLAYING");
    expect(result.current.selectedTileId).toBeNull();
    expect(result.current.roundMatchedPairsCount).toBe(1);
  });

  it("evaluates a correct match bidirectional (Right -> Left)", () => {
    const { result } = renderHook(() =>
      useMatchingGameEngine({
        rounds: mockRounds,
        deckId: "deck_123",
        synthesizer: mockSynthesizer,
      }),
    );

    act(() => {
      result.current.handleSelectTile("m_2"); // card_2
    });
    expect(result.current.engineState).toBe("CARD_SELECTED");

    act(() => {
      result.current.handleSelectTile("w_2"); // card_2
    });

    expect(result.current.engineState).toBe("MATCH_SUCCESS");
    expect(result.current.tileStates["m_2"]).toBe("MATCHED");
    expect(result.current.tileStates["w_2"]).toBe("MATCHED");
  });

  it("evaluates a mismatch, resets combo, plays mismatch buzz, and restores neutral state after delay", () => {
    const { result } = renderHook(() =>
      useMatchingGameEngine({
        rounds: mockRounds,
        deckId: "deck_123",
        synthesizer: mockSynthesizer,
      }),
    );

    // Give 1 correct match first to have combo = 1
    act(() => {
      result.current.handleSelectTile("w_1");
      result.current.handleSelectTile("m_1");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.currentCombo).toBe(1);

    // Now mismatch
    act(() => {
      result.current.handleSelectTile("w_2"); // card_2
    });
    act(() => {
      result.current.handleSelectTile("m_3"); // card_3
    });

    expect(result.current.engineState).toBe("MATCH_ERROR");
    expect(result.current.tileStates["w_2"]).toBe("MISMATCH");
    expect(result.current.tileStates["m_3"]).toBe("MISMATCH");
    expect(mockSynthesizer.playMismatchBuzz).toHaveBeenCalled();
    expect(result.current.currentCombo).toBe(0);

    // Fast forward mismatch shake animation delay (400ms)
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.engineState).toBe("PLAYING");
    expect(result.current.tileStates["w_2"]).toBe("NEUTRAL");
    expect(result.current.tileStates["m_3"]).toBe("NEUTRAL");
    expect(result.current.selectedTileId).toBeNull();
  });

  it("locks user interactions during CHECKING_MATCH, MATCH_SUCCESS, and MATCH_ERROR", () => {
    const { result } = renderHook(() =>
      useMatchingGameEngine({
        rounds: mockRounds,
        deckId: "deck_123",
        synthesizer: mockSynthesizer,
      }),
    );

    act(() => {
      result.current.handleSelectTile("w_1");
      result.current.handleSelectTile("m_2"); // Mismatch
    });

    expect(result.current.isLocked).toBe(true);

    // Attempt to click another tile during locked state
    act(() => {
      result.current.handleSelectTile("w_3");
    });
    expect(result.current.tileStates["w_3"]).toBe("NEUTRAL");
  });

  it("plays combo ding when combo reaches >= 3", () => {
    const { result } = renderHook(() =>
      useMatchingGameEngine({
        rounds: mockRounds,
        deckId: "deck_123",
        synthesizer: mockSynthesizer,
      }),
    );

    // 1st match
    act(() => {
      result.current.handleSelectTile("w_1");
      result.current.handleSelectTile("m_1");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // 2nd match
    act(() => {
      result.current.handleSelectTile("w_2");
      result.current.handleSelectTile("m_2");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // 3rd match -> Combo 3
    act(() => {
      result.current.handleSelectTile("w_3");
      result.current.handleSelectTile("m_3");
    });

    expect(mockSynthesizer.playComboDing).toHaveBeenCalledWith(3);
  });

  it("completes round and advances to next round when all 5 pairs matched", () => {
    const { result } = renderHook(() =>
      useMatchingGameEngine({
        rounds: mockRounds,
        deckId: "deck_123",
        synthesizer: mockSynthesizer,
      }),
    );

    // Match all 5 pairs in Round 1
    const pairs = [
      ["w_1", "m_1"],
      ["w_2", "m_2"],
      ["w_3", "m_3"],
      ["w_4", "m_4"],
      ["w_5", "m_5"],
    ];

    for (const [w, m] of pairs) {
      act(() => {
        result.current.handleSelectTile(w);
        result.current.handleSelectTile(m);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
    }

    expect(result.current.engineState).toBe("ROUND_COMPLETED");

    // Advance round transition delay (600ms)
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current.currentRoundIndex).toBe(1);
    expect(result.current.engineState).toBe("PLAYING");
    expect(result.current.wordTiles[0].id).toBe("w_6");
  });

  it("submits quiz session and transitions to SESSION_FINISHED when final round is completed", async () => {
    const singleRound = [mockRounds[0]];
    const onCompleteMock = vi.fn();
    const { result } = renderHook(() =>
      useMatchingGameEngine({
        rounds: singleRound,
        deckId: "deck_123",
        synthesizer: mockSynthesizer,
        onSessionComplete: onCompleteMock,
      }),
    );

    const pairs = [
      ["w_1", "m_1"],
      ["w_2", "m_2"],
      ["w_3", "m_3"],
      ["w_4", "m_4"],
      ["w_5", "m_5"],
    ];

    for (const [w, m] of pairs) {
      act(() => {
        result.current.handleSelectTile(w);
        result.current.handleSelectTile(m);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
    }

    await act(async () => {
      await Promise.resolve();
    });

    expect(practiceService.submitMatchingQuiz).toHaveBeenCalled();
    expect(result.current.isCompleted).toBe(true);
    expect(result.current.engineState).toBe("SESSION_FINISHED");
    expect(result.current.result).not.toBeNull();
  });
});
