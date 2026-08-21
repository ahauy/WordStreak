import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type {
  MatchingRoundDto,
  MatchingCardItemDto,
  MatchingTileState,
  MatchingAnswerSubmissionDto,
  MatchingQuizResultDto,
} from "@wordstreak/shared-types";
import { practiceService } from "../services/practiceService";
import type { WebAudioSynthesizer } from "./useWebAudioSynthesizer";

export type MatchingEngineState =
  | "IDLE"
  | "PLAYING"
  | "CARD_SELECTED"
  | "CHECKING_MATCH"
  | "MATCH_SUCCESS"
  | "MATCH_ERROR"
  | "ROUND_COMPLETED"
  | "SESSION_FINISHED";

export interface UseMatchingGameEngineProps {
  rounds: MatchingRoundDto[];
  deckId: string;
  isZenMode?: boolean;
  synthesizer?: WebAudioSynthesizer;
  onSessionComplete?: (result: MatchingQuizResultDto) => void;
}

export interface UseMatchingGameEngineReturn {
  engineState: MatchingEngineState;
  currentRoundIndex: number;
  totalRounds: number;
  currentRound: MatchingRoundDto | null;
  wordTiles: MatchingCardItemDto[];
  meaningTiles: MatchingCardItemDto[];
  tileStates: Record<string, MatchingTileState>;
  selectedTileId: string | null;
  currentCombo: number;
  maxCombo: number;
  matchedPairsCount: number;
  totalPairsCount: number;
  roundMatchedPairsCount: number;
  timerSeconds: number;
  isZenMode: boolean;
  isLocked: boolean;
  isCompleted: boolean;
  isSubmitting: boolean;
  result: MatchingQuizResultDto | null;
  error: string | null;
  handleSelectTile: (tileId: string) => void;
  handleRestart: () => void;
}

export function useMatchingGameEngine({
  rounds,
  deckId,
  isZenMode = false,
  synthesizer,
  onSessionComplete,
}: UseMatchingGameEngineProps): UseMatchingGameEngineReturn {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [engineState, setEngineState] = useState<MatchingEngineState>(() =>
    rounds.length > 0 ? "PLAYING" : "IDLE",
  );
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [tileStates, setTileStates] = useState<
    Record<string, MatchingTileState>
  >({});
  const [currentCombo, setCurrentCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [roundMatchedPairsCount, setRoundMatchedPairsCount] =
    useState<number>(0);
  const [matchedPairsCount, setMatchedPairsCount] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(() =>
    isZenMode ? 0 : 45,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [result, setResult] = useState<MatchingQuizResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync refs to protect against rapid/synchronous batch clicks
  const selectedTileIdRef = useRef<string | null>(null);
  const engineStateRef = useRef<MatchingEngineState>(
    rounds.length > 0 ? "PLAYING" : "IDLE",
  );
  const tileStatesRef = useRef<Record<string, MatchingTileState>>({});
  const currentComboRef = useRef<number>(0);
  const roundMatchedPairsCountRef = useRef<number>(0);
  const currentRoundIndexRef = useRef<number>(0);

  // Telemetry & Attempts Tracking
  const answersRef = useRef<MatchingAnswerSubmissionDto[]>([]);
  const cardAttemptsRef = useRef<Record<string, number>>({});
  const pairStartTimeRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundAdvancementTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const totalRounds = rounds.length;
  const currentRound = rounds[currentRoundIndex] || null;

  const wordTiles = useMemo(
    () => currentRound?.wordTiles || currentRound?.columnA || [],
    [currentRound],
  );

  const meaningTiles = useMemo(
    () => currentRound?.meaningTiles || currentRound?.columnB || [],
    [currentRound],
  );

  const totalPairsCount = useMemo(() => {
    return rounds.reduce((acc, r) => {
      const count = r.wordTiles?.length || r.columnA?.length || 0;
      return acc + count;
    }, 0);
  }, [rounds]);

  // Helper to update engine state and ref in sync
  const updateEngineState = useCallback((state: MatchingEngineState) => {
    engineStateRef.current = state;
    setEngineState(state);
  }, []);

  // Helper to update selected tile and ref in sync
  const updateSelectedTileId = useCallback((id: string | null) => {
    selectedTileIdRef.current = id;
    setSelectedTileId(id);
  }, []);

  // Initialize tile states for a round
  const initializeRound = useCallback(
    (round: MatchingRoundDto | null) => {
      if (!round) return;
      const states: Record<string, MatchingTileState> = {};
      const words = round.wordTiles || round.columnA || [];
      const meanings = round.meaningTiles || round.columnB || [];

      [...words, ...meanings].forEach((tile) => {
        states[tile.id] = "NEUTRAL";
      });

      tileStatesRef.current = states;
      setTileStates(states);
      updateSelectedTileId(null);
      roundMatchedPairsCountRef.current = 0;
      setRoundMatchedPairsCount(0);
      pairStartTimeRef.current = Date.now();
    },
    [updateSelectedTileId],
  );

  // Update round initialization when round index changes
  const prevRoundIndexRef = useRef<number>(-1);
  useEffect(() => {
    if (rounds.length > 0 && currentRound) {
      if (prevRoundIndexRef.current !== currentRoundIndex) {
        if (sessionStartTimeRef.current === 0) {
          sessionStartTimeRef.current = Date.now();
        }
        prevRoundIndexRef.current = currentRoundIndex;
        currentRoundIndexRef.current = currentRoundIndex;
        initializeRound(currentRound);
        updateEngineState("PLAYING");
      }
    } else if (rounds.length === 0 && engineStateRef.current !== "IDLE") {
      updateEngineState("IDLE");
    }
  }, [
    currentRoundIndex,
    rounds.length,
    currentRound,
    initializeRound,
    updateEngineState,
  ]);

  // Timer Tick Effect
  useEffect(() => {
    if (
      engineState === "IDLE" ||
      engineState === "SESSION_FINISHED" ||
      isCompleted
    ) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (isZenMode) {
          return prev + 1;
        } else {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        }
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [engineState, isCompleted, isZenMode]);

  const isLocked = useMemo(() => {
    return (
      engineState === "CHECKING_MATCH" ||
      engineState === "MATCH_SUCCESS" ||
      engineState === "MATCH_ERROR" ||
      engineState === "ROUND_COMPLETED" ||
      engineState === "SESSION_FINISHED" ||
      isSubmitting ||
      isCompleted
    );
  }, [engineState, isSubmitting, isCompleted]);

  // Submit Quiz helper
  const submitQuizSession = useCallback(async () => {
    if (isSubmitting || isCompleted) return;
    setIsSubmitting(true);
    updateEngineState("SESSION_FINISHED");

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const totalTimeMs = Math.max(
      sessionStartTimeRef.current > 0
        ? Date.now() - sessionStartTimeRef.current
        : 0,
      1000,
    );

    try {
      const submissionDto = {
        deckId,
        mode: "MATCHING" as const,
        quizType: "matching" as const,
        totalPairs: totalPairsCount,
        correctPairs: matchedPairsCount,
        maxCombo,
        totalTimeMs,
        answers: answersRef.current,
      };

      const resultData =
        await practiceService.submitMatchingQuiz(submissionDto);
      setResult(resultData);
      setIsCompleted(true);
      if (onSessionComplete) {
        onSessionComplete(resultData);
      }
    } catch (err: unknown) {
      console.error("Failed to submit matching quiz:", err);
      const errMsg =
        err instanceof Error
          ? err.message
          : "Failed to submit practice results.";
      setError(errMsg);
      // Fallback local result if API fails
      const fallbackResult: MatchingQuizResultDto = {
        totalPairs: totalPairsCount,
        matchedCount: matchedPairsCount,
        accuracyPercentage:
          totalPairsCount > 0
            ? Math.round((matchedPairsCount / totalPairsCount) * 100)
            : 100,
        maxCombo,
        totalTimeMs,
        totalXpEarned: matchedPairsCount * 2,
        xpBreakdown: {
          baseXp: matchedPairsCount * 2,
          comboBonusXp: 0,
          speedBonusXp: 0,
          perfectBonusXp: 0,
          totalXp: matchedPairsCount * 2,
        },
        missedCards: [],
      };
      setResult(fallbackResult);
      setIsCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    deckId,
    totalPairsCount,
    matchedPairsCount,
    maxCombo,
    onSessionComplete,
    isSubmitting,
    isCompleted,
    updateEngineState,
  ]);

  // Helper: Select first tile
  const selectTileOnly = useCallback(
    (tileId: string) => {
      updateSelectedTileId(tileId);
      tileStatesRef.current = {
        ...tileStatesRef.current,
        [tileId]: "SELECTED",
      };
      setTileStates({ ...tileStatesRef.current });
      updateEngineState("CARD_SELECTED");
    },
    [updateSelectedTileId, updateEngineState],
  );

  // Helper: Deselect current tile
  const deselectTile = useCallback(
    (tileId: string) => {
      updateSelectedTileId(null);
      tileStatesRef.current = {
        ...tileStatesRef.current,
        [tileId]: "NEUTRAL",
      };
      setTileStates({ ...tileStatesRef.current });
      updateEngineState("PLAYING");
    },
    [updateSelectedTileId, updateEngineState],
  );

  // Helper: Switch selection within same column
  const switchSelectedTile = useCallback(
    (prevTileId: string, newTileId: string) => {
      updateSelectedTileId(newTileId);
      tileStatesRef.current = {
        ...tileStatesRef.current,
        [prevTileId]: "NEUTRAL",
        [newTileId]: "SELECTED",
      };
      setTileStates({ ...tileStatesRef.current });
      updateEngineState("CARD_SELECTED");
    },
    [updateSelectedTileId, updateEngineState],
  );

  // Helper: Handle successful match pairing
  const handleSuccessfulMatch = useCallback(
    (
      firstTile: MatchingCardItemDto,
      clickedTile: MatchingCardItemDto,
      roundPairTotal: number,
    ) => {
      updateEngineState("MATCH_SUCCESS");
      const nextCombo = currentComboRef.current + 1;
      currentComboRef.current = nextCombo;
      setCurrentCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));

      if (synthesizer) {
        if (nextCombo >= 3) {
          synthesizer.playComboDing(nextCombo);
        } else {
          synthesizer.playSuccessChime();
        }
      }

      const cardId = firstTile.cardId;
      const prevAttempts = cardAttemptsRef.current[cardId] || 0;
      const currentAttempts = prevAttempts + 1;
      cardAttemptsRef.current[cardId] = currentAttempts;

      const matchedInMs = Math.max(
        pairStartTimeRef.current > 0
          ? Date.now() - pairStartTimeRef.current
          : 100,
        100,
      );

      answersRef.current.push({
        cardId,
        matchedInMs,
        responseTimeMs: matchedInMs,
        attempts: currentAttempts,
        isCorrectFirstTry: currentAttempts === 1,
        isCorrect: true,
      });

      tileStatesRef.current = {
        ...tileStatesRef.current,
        [firstTile.id]: "MATCHED",
        [clickedTile.id]: "MATCHED",
      };
      setTileStates({ ...tileStatesRef.current });

      const nextRoundMatched = roundMatchedPairsCountRef.current + 1;
      roundMatchedPairsCountRef.current = nextRoundMatched;
      setRoundMatchedPairsCount(nextRoundMatched);
      setMatchedPairsCount((prev) => prev + 1);

      actionTimeoutRef.current = setTimeout(() => {
        updateSelectedTileId(null);
        pairStartTimeRef.current = Date.now();

        if (nextRoundMatched >= roundPairTotal) {
          updateEngineState("ROUND_COMPLETED");

          if (currentRoundIndexRef.current + 1 < totalRounds) {
            roundAdvancementTimeoutRef.current = setTimeout(() => {
              const nextIdx = currentRoundIndexRef.current + 1;
              currentRoundIndexRef.current = nextIdx;
              setCurrentRoundIndex(nextIdx);
              updateEngineState("PLAYING");
            }, 600);
          } else {
            submitQuizSession();
          }
        } else {
          updateEngineState("PLAYING");
        }
      }, 300);
    },
    [
      synthesizer,
      totalRounds,
      submitQuizSession,
      updateEngineState,
      updateSelectedTileId,
    ],
  );

  // Helper: Handle mismatched pair attempt
  const handleFailedMatch = useCallback(
    (firstTile: MatchingCardItemDto, clickedTile: MatchingCardItemDto) => {
      updateEngineState("MATCH_ERROR");
      currentComboRef.current = 0;
      setCurrentCombo(0);

      if (synthesizer) {
        synthesizer.playMismatchBuzz();
      }

      const cardId = firstTile.cardId;
      const secondCardId = clickedTile.cardId;
      cardAttemptsRef.current[cardId] =
        (cardAttemptsRef.current[cardId] || 0) + 1;
      cardAttemptsRef.current[secondCardId] =
        (cardAttemptsRef.current[secondCardId] || 0) + 1;

      tileStatesRef.current = {
        ...tileStatesRef.current,
        [firstTile.id]: "MISMATCH",
        [clickedTile.id]: "MISMATCH",
      };
      setTileStates({ ...tileStatesRef.current });

      actionTimeoutRef.current = setTimeout(() => {
        tileStatesRef.current = {
          ...tileStatesRef.current,
          [firstTile.id]: "NEUTRAL",
          [clickedTile.id]: "NEUTRAL",
        };
        setTileStates({ ...tileStatesRef.current });
        updateSelectedTileId(null);
        pairStartTimeRef.current = Date.now();
        updateEngineState("PLAYING");
      }, 400);
    },
    [synthesizer, updateEngineState, updateSelectedTileId],
  );

  // Handle Tile Selection
  const handleSelectTile = useCallback(
    (tileId: string) => {
      const currentLocked =
        engineStateRef.current === "CHECKING_MATCH" ||
        engineStateRef.current === "MATCH_SUCCESS" ||
        engineStateRef.current === "MATCH_ERROR" ||
        engineStateRef.current === "ROUND_COMPLETED" ||
        engineStateRef.current === "SESSION_FINISHED" ||
        isSubmitting ||
        isCompleted;

      if (currentLocked) return;

      const activeRound = rounds[currentRoundIndexRef.current] || null;
      const roundWords = activeRound?.wordTiles || activeRound?.columnA || [];
      const roundMeanings =
        activeRound?.meaningTiles || activeRound?.columnB || [];
      const allTiles = [...roundWords, ...roundMeanings];
      const clickedTile = allTiles.find((t) => t.id === tileId);

      if (!clickedTile || tileStatesRef.current[tileId] === "MATCHED") {
        return;
      }

      const currentSelected = selectedTileIdRef.current;

      if (!currentSelected) {
        selectTileOnly(tileId);
        return;
      }

      const firstTile = allTiles.find((t) => t.id === currentSelected);
      if (!firstTile) {
        selectTileOnly(tileId);
        return;
      }

      if (currentSelected === tileId) {
        deselectTile(tileId);
        return;
      }

      if (firstTile.type === clickedTile.type) {
        switchSelectedTile(firstTile.id, tileId);
        return;
      }

      updateEngineState("CHECKING_MATCH");
      const isMatch = firstTile.cardId === clickedTile.cardId;

      if (isMatch) {
        handleSuccessfulMatch(firstTile, clickedTile, roundWords.length);
      } else {
        handleFailedMatch(firstTile, clickedTile);
      }
    },
    [
      rounds,
      isSubmitting,
      isCompleted,
      selectTileOnly,
      deselectTile,
      switchSelectedTile,
      updateEngineState,
      handleSuccessfulMatch,
      handleFailedMatch,
    ],
  );

  // Restart Handler
  const handleRestart = useCallback(() => {
    if (actionTimeoutRef.current) {
      clearTimeout(actionTimeoutRef.current);
      actionTimeoutRef.current = null;
    }
    if (roundAdvancementTimeoutRef.current) {
      clearTimeout(roundAdvancementTimeoutRef.current);
      roundAdvancementTimeoutRef.current = null;
    }
    answersRef.current = [];
    cardAttemptsRef.current = {};
    sessionStartTimeRef.current = Date.now();
    pairStartTimeRef.current = Date.now();
    prevRoundIndexRef.current = -1;
    currentRoundIndexRef.current = 0;
    currentComboRef.current = 0;
    roundMatchedPairsCountRef.current = 0;
    setCurrentRoundIndex(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setMatchedPairsCount(0);
    setRoundMatchedPairsCount(0);
    setIsCompleted(false);
    setIsSubmitting(false);
    setResult(null);
    setError(null);
    setTimerSeconds(isZenMode ? 0 : 45);

    if (rounds.length > 0) {
      initializeRound(rounds[0]);
      updateEngineState("PLAYING");
    } else {
      updateEngineState("IDLE");
    }
  }, [rounds, isZenMode, initializeRound, updateEngineState]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
      }
      if (roundAdvancementTimeoutRef.current) {
        clearTimeout(roundAdvancementTimeoutRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return {
    engineState,
    currentRoundIndex,
    totalRounds,
    currentRound,
    wordTiles,
    meaningTiles,
    tileStates,
    selectedTileId,
    currentCombo,
    maxCombo,
    matchedPairsCount,
    totalPairsCount,
    roundMatchedPairsCount,
    timerSeconds,
    isZenMode,
    isLocked,
    isCompleted,
    isSubmitting,
    result,
    error,
    handleSelectTile,
    handleRestart,
  };
}
