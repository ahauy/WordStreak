import { useState, useEffect, useRef, useCallback } from "react";
import type {
  FillBlankQuestionDto,
  QuizAnswerSubmissionDto,
  QuizResultResponseDto,
} from "@wordstreak/shared-types";
import { practiceService } from "../services/practiceService";

export type FillBlankFeedbackState =
  "IDLE" | "CORRECT" | "INCORRECT" | "TIMEOUT";

interface UseFillBlankQuizOptions {
  questions: FillBlankQuestionDto[];
  deckId: string;
  isZenMode?: boolean;
  onComplete?: (result: QuizResultResponseDto) => void;
}

export function useFillBlankQuiz({
  questions,
  deckId,
  isZenMode = false,
  onComplete,
}: UseFillBlankQuizOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedInput, setTypedInput] = useState("");
  const [selectedTileIndices, setSelectedTileIndices] = useState<number[]>([]);
  const [isAnagramMode, setIsAnagramMode] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [feedbackState, setFeedbackState] =
    useState<FillBlankFeedbackState>("IDLE");
  const [timerSeconds, setTimerSeconds] = useState(25);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [highestCombo, setHighestCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswerSubmissionDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResultResponseDto | null>(null);

  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartTimeRef = useRef<number>(0);

  const currentQuestion = questions[currentIndex] || null;
  const isLastQuestion = currentIndex >= questions.length - 1;
  const isCompleted = result !== null;

  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentIndex]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Advance to next question or trigger submission
  const advance = useCallback(
    async (collectedAnswers: QuizAnswerSubmissionDto[]) => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = null;
      }

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setTypedInput("");
        setSelectedTileIndices([]);
        setHintLevel(0);
        setFeedbackState("IDLE");
        setTimerSeconds(25);
        questionStartTimeRef.current = Date.now();
      } else {
        // Complete quiz session
        setIsSubmitting(true);
        try {
          const res = await practiceService.submitQuiz({
            deckId,
            totalQuestions: questions.length,
            answers: collectedAnswers,
          });
          setResult(res);
          onComplete?.(res);
        } catch (error) {
          console.error("Failed to submit fill-in-the-blank quiz:", error);
          const correctCount = collectedAnswers.filter(
            (a) => a.isCorrect,
          ).length;
          const fallbackRes: QuizResultResponseDto = {
            totalQuestions: questions.length,
            correctCount,
            accuracyPercentage: Math.round(
              (correctCount / questions.length) * 100,
            ),
            totalXpEarned: correctCount * 10,
            maxCombo: highestCombo,
            missedCards: [],
          };
          setResult(fallbackRes);
          onComplete?.(fallbackRes);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [currentIndex, questions.length, deckId, highestCombo, onComplete],
  );

  // Manual skip feedback
  const skipFeedback = useCallback(() => {
    if (feedbackState !== "IDLE") {
      advance(answers);
    }
  }, [feedbackState, advance, answers]);

  // Submit and evaluate answer
  const submitAnswer = useCallback(
    (inputOverride?: string) => {
      if (feedbackState !== "IDLE" || !currentQuestion) return;

      const rawText = inputOverride !== undefined ? inputOverride : typedInput;
      const submitted = rawText.trim().toLowerCase();

      const targetBase = currentQuestion.targetWord.trim().toLowerCase();
      const targetInflection = (
        currentQuestion.targetInflection || currentQuestion.targetWord
      )
        .trim()
        .toLowerCase();

      const isCorrect =
        submitted === targetBase || submitted === targetInflection;
      const timeSpentMs = Date.now() - questionStartTimeRef.current;

      setFeedbackState(isCorrect ? "CORRECT" : "INCORRECT");

      if (isCorrect) {
        setScore((prev) => prev + 1);
        setCurrentCombo((prev) => {
          const nextCombo = prev + 1;
          setHighestCombo((h) => Math.max(h, nextCombo));
          return nextCombo;
        });
      } else {
        setCurrentCombo(0);
      }

      const answerItem: QuizAnswerSubmissionDto = {
        questionId: currentQuestion.id,
        cardId: currentQuestion.cardId,
        selectedOptionId: null,
        isCorrect,
        timeSpentMs,
      };

      const updatedAnswers = [...answers, answerItem];
      setAnswers(updatedAnswers);

      advanceTimeoutRef.current = setTimeout(() => {
        advance(updatedAnswers);
      }, 1200);
    },
    [feedbackState, currentQuestion, typedInput, answers, advance],
  );

  // Handle timeout
  const handleTimeout = useCallback(() => {
    if (feedbackState !== "IDLE" || !currentQuestion) return;

    setFeedbackState("TIMEOUT");
    setCurrentCombo(0);

    const answerItem: QuizAnswerSubmissionDto = {
      questionId: currentQuestion.id,
      cardId: currentQuestion.cardId,
      selectedOptionId: null,
      isCorrect: false,
      timeSpentMs: 25000,
    };

    const updatedAnswers = [...answers, answerItem];
    setAnswers(updatedAnswers);

    advanceTimeoutRef.current = setTimeout(() => {
      advance(updatedAnswers);
    }, 1200);
  }, [feedbackState, currentQuestion, answers, advance]);

  // Trigger progressive hint
  const triggerHint = useCallback(() => {
    if (feedbackState !== "IDLE" || !currentQuestion) return;
    setHintLevel((prev) => Math.min(prev + 1, 2));

    const targetWord =
      currentQuestion.targetInflection || currentQuestion.targetWord;
    if (targetWord && typedInput.length === 0) {
      setTypedInput(targetWord.charAt(0));
    }
  }, [feedbackState, currentQuestion, typedInput]);

  // Anagram tile picker methods
  const selectAnagramTile = useCallback(
    (index: number) => {
      if (feedbackState !== "IDLE" || !currentQuestion) return;
      if (selectedTileIndices.includes(index)) return;

      const newIndices = [...selectedTileIndices, index];
      setSelectedTileIndices(newIndices);

      const letter = currentQuestion.scrambledLetters[index];
      const newTyped = typedInput + letter;
      setTypedInput(newTyped);

      // Auto-submit if word length matches
      const targetLength = (
        currentQuestion.targetInflection || currentQuestion.targetWord
      ).length;
      if (newTyped.length === targetLength) {
        submitAnswer(newTyped);
      }
    },
    [
      feedbackState,
      currentQuestion,
      selectedTileIndices,
      typedInput,
      submitAnswer,
    ],
  );

  const removeLastAnagramTile = useCallback(() => {
    if (feedbackState !== "IDLE" || selectedTileIndices.length === 0) return;
    const newIndices = selectedTileIndices.slice(0, -1);
    setSelectedTileIndices(newIndices);
    setTypedInput(typedInput.slice(0, -1));
  }, [feedbackState, selectedTileIndices, typedInput]);

  const clearAnagramTiles = useCallback(() => {
    if (feedbackState !== "IDLE") return;
    setSelectedTileIndices([]);
    setTypedInput("");
  }, [feedbackState]);

  // Timer countdown ticker
  useEffect(() => {
    if (isZenMode || feedbackState !== "IDLE" || isCompleted) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isZenMode, feedbackState, isCompleted, handleTimeout, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || isSubmitting) return;

      // Space to skip feedback delay
      if (e.code === "Space" && feedbackState !== "IDLE") {
        e.preventDefault();
        skipFeedback();
        return;
      }

      // Enter to submit or advance
      if (e.key === "Enter") {
        e.preventDefault();
        if (feedbackState !== "IDLE") {
          skipFeedback();
        } else if (typedInput.trim().length > 0) {
          submitAnswer();
        }
        return;
      }

      // Ctrl+H or Cmd+H for hint
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        triggerHint();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    feedbackState,
    isCompleted,
    isSubmitting,
    skipFeedback,
    typedInput,
    submitAnswer,
    triggerHint,
  ]);

  // Restart quiz
  const retakeQuiz = useCallback(() => {
    setCurrentIndex(0);
    setTypedInput("");
    setSelectedTileIndices([]);
    setHintLevel(0);
    setFeedbackState("IDLE");
    setTimerSeconds(25);
    setCurrentCombo(0);
    setHighestCombo(0);
    setScore(0);
    setAnswers([]);
    setResult(null);
    setIsSubmitting(false);
    questionStartTimeRef.current = Date.now();
  }, []);

  return {
    currentIndex,
    currentQuestion,
    totalQuestions: questions.length,
    typedInput,
    setTypedInput,
    selectedTileIndices,
    isAnagramMode,
    setIsAnagramMode,
    hintLevel,
    feedbackState,
    timerSeconds,
    currentCombo,
    highestCombo,
    score,
    isLastQuestion,
    isSubmitting,
    isCompleted,
    result,
    submitAnswer,
    triggerHint,
    selectAnagramTile,
    removeLastAnagramTile,
    clearAnagramTiles,
    skipFeedback,
    retakeQuiz,
  };
}
