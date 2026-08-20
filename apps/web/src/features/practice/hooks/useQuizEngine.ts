import { useState, useEffect, useRef, useCallback } from "react";
import type {
  QuizQuestionDto,
  QuizAnswerSubmissionDto,
  QuizResultResponseDto,
} from "@wordstreak/shared-types";
import { practiceService } from "../services/practiceService";

export type FeedbackState = "IDLE" | "CORRECT" | "INCORRECT" | "TIMEOUT";

interface UseQuizEngineOptions {
  questions: QuizQuestionDto[];
  deckId: string;
  isZenMode?: boolean;
  onComplete?: (result: QuizResultResponseDto) => void;
}

export function useQuizEngine({
  questions,
  deckId,
  isZenMode = false,
  onComplete,
}: UseQuizEngineOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("IDLE");
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [highestCombo, setHighestCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswerSubmissionDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResultResponseDto | null>(null);

  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  const currentQuestion = questions[currentIndex] || null;
  const isLastQuestion = currentIndex >= questions.length - 1;
  const isCompleted = result !== null;

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
        setSelectedOptionId(null);
        setFeedbackState("IDLE");
        setTimerSeconds(15);
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
          console.error("Failed to submit quiz session:", error);
          // Optimistic local fallback result
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

  // User manually skips the 1.0s feedback pause
  const skipFeedback = useCallback(() => {
    if (feedbackState !== "IDLE") {
      advance(answers);
    }
  }, [feedbackState, advance, answers]);

  // Handle option selection
  const selectOption = useCallback(
    (optionId: string) => {
      if (feedbackState !== "IDLE" || !currentQuestion) return;

      const timeSpentMs = Date.now() - questionStartTimeRef.current;
      const selectedOption = currentQuestion.options.find(
        (o) => o.id === optionId,
      );
      const isCorrect = selectedOption?.isCorrect ?? false;

      setSelectedOptionId(optionId);
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
        selectedOptionId: optionId,
        isCorrect,
        timeSpentMs,
      };

      const updatedAnswers = [...answers, answerItem];
      setAnswers(updatedAnswers);

      advanceTimeoutRef.current = setTimeout(() => {
        advance(updatedAnswers);
      }, 1000);
    },
    [feedbackState, currentQuestion, answers, advance],
  );

  // Handle timeout (15s expired)
  const handleTimeout = useCallback(() => {
    if (feedbackState !== "IDLE" || !currentQuestion) return;

    setFeedbackState("TIMEOUT");
    setCurrentCombo(0);

    const answerItem: QuizAnswerSubmissionDto = {
      questionId: currentQuestion.id,
      cardId: currentQuestion.cardId,
      selectedOptionId: null,
      isCorrect: false,
      timeSpentMs: 15000,
    };

    const updatedAnswers = [...answers, answerItem];
    setAnswers(updatedAnswers);

    advanceTimeoutRef.current = setTimeout(() => {
      advance(updatedAnswers);
    }, 1000);
  }, [feedbackState, currentQuestion, answers, advance]);

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

      // Spacebar to skip feedback window
      if (e.code === "Space" && feedbackState !== "IDLE") {
        e.preventDefault();
        skipFeedback();
        return;
      }

      if (feedbackState !== "IDLE" || !currentQuestion) return;

      const key = e.key.toLowerCase();
      let index = -1;

      if (key === "1" || key === "a") index = 0;
      else if (key === "2" || key === "b") index = 1;
      else if (key === "3" || key === "c") index = 2;
      else if (key === "4" || key === "d") index = 3;

      if (index >= 0 && index < currentQuestion.options.length) {
        e.preventDefault();
        selectOption(currentQuestion.options[index].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    feedbackState,
    currentQuestion,
    selectOption,
    skipFeedback,
    isCompleted,
    isSubmitting,
  ]);

  // Restart quiz on same deck
  const retakeQuiz = useCallback(() => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setFeedbackState("IDLE");
    setTimerSeconds(15);
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
    selectedOptionId,
    feedbackState,
    timerSeconds,
    currentCombo,
    highestCombo,
    score,
    isLastQuestion,
    isSubmitting,
    isCompleted,
    result,
    selectOption,
    skipFeedback,
    retakeQuiz,
  };
}
