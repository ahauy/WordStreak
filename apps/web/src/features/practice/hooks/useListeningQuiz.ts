import { useState, useRef, useCallback, useEffect } from "react";
import type {
  ListeningQuestionDto,
  ListeningAnswerSubmissionDto,
  QuizResultResponseDto,
  DiffSpan,
} from "@wordstreak/shared-types";
import { checkAnswer, computeCharacterDiff } from "../utils/spellingDiff";
import { useAudioPlayer, type UseAudioPlayerReturn } from "./useAudioPlayer";
import { practiceService } from "../services/practiceService";

export interface UseListeningQuizProps {
  questions: ListeningQuestionDto[];
  deckId: string;
  isZenMode?: boolean;
  onSessionComplete?: (result: QuizResultResponseDto) => void;
}

export type FeedbackState = "IDLE" | "CORRECT" | "INCORRECT";

export interface UseListeningQuizReturn {
  currentIndex: number;
  currentQuestion: ListeningQuestionDto | null;
  totalQuestions: number;
  typedInput: string;
  feedbackState: FeedbackState;
  hintLevel: number;
  replayCount: number;
  currentCombo: number;
  maxCombo: number;
  timerSeconds: number;
  isSpeedBonusEligible: boolean;
  characterDiff: DiffSpan[] | null;
  isCompleted: boolean;
  result: QuizResultResponseDto | null;
  audioPlayer: UseAudioPlayerReturn;
  setTypedInput: (val: string) => void;
  submitAnswer: (overrideAnswer?: string) => Promise<void>;
  skipToNext: () => void;
  triggerHint: () => void;
  replayAudio: () => Promise<void>;
  toggleSpeed: () => void;
  retakeQuiz: () => void;
}

export function useListeningQuiz({
  questions,
  deckId,
  isZenMode = false,
  onSessionComplete,
}: UseListeningQuizProps): UseListeningQuizReturn {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [typedInput, setTypedInput] = useState<string>("");
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("IDLE");
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [replayCount, setReplayCount] = useState<number>(0);
  const [currentCombo, setCurrentCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(20);
  const [isSpeedBonusEligible, setIsSpeedBonusEligible] =
    useState<boolean>(true);
  const [characterDiff, setCharacterDiff] = useState<DiffSpan[] | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [result, setResult] = useState<QuizResultResponseDto | null>(null);

  const answersRef = useRef<ListeningAnswerSubmissionDto[]>([]);
  const questionStartTimeRef = useRef<number>(Date.now());
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioPlayer = useAudioPlayer();

  const currentQuestion = questions[currentIndex] || null;
  const totalQuestions = questions.length;

  // Auto-play audio when currentQuestion changes
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      questionStartTimeRef.current = Date.now();
      audioPlayer.playAudio(currentQuestion.word, currentQuestion.audioUrl);
    }
  }, [currentIndex, currentQuestion, isCompleted]);

  // Countdown timer in standard mode
  useEffect(() => {
    if (
      isZenMode ||
      feedbackState !== "IDLE" ||
      isCompleted ||
      totalQuestions === 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isZenMode, feedbackState, isCompleted, totalQuestions, currentIndex]);

  // Auto-submit on timer expiry
  useEffect(() => {
    if (
      !isZenMode &&
      timerSeconds === 0 &&
      feedbackState === "IDLE" &&
      currentQuestion
    ) {
      handleAnswerEvaluation("");
    }
  }, [timerSeconds, isZenMode, feedbackState, currentQuestion]);

  const advanceQuestion = useCallback(async () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setTypedInput("");
      setFeedbackState("IDLE");
      setHintLevel(0);
      setReplayCount(0);
      setTimerSeconds(20);
      setIsSpeedBonusEligible(true);
      setCharacterDiff(null);
    } else {
      // Finished all questions
      setIsCompleted(true);
      const allAnswers = answersRef.current;
      const correctCount = allAnswers.filter((a) => a.isCorrect).length;
      const accuracyPercentage =
        allAnswers.length > 0
          ? Math.round((correctCount / allAnswers.length) * 100)
          : 0;

      const missedCards = questions
        .filter((q) => {
          const ans = allAnswers.find((a) => a.cardId === q.cardId);
          return ans ? !ans.isCorrect : false;
        })
        .map((q) => ({
          cardId: q.cardId,
          word: q.word,
          meaning: q.meaning,
          phonetic: q.phonetic,
          audioUrl: q.audioUrl,
        }));

      const defaultResult: QuizResultResponseDto = {
        totalQuestions: questions.length,
        correctCount,
        accuracyPercentage,
        totalXpEarned: correctCount * 10,
        maxCombo,
        missedCards,
      };

      try {
        const res = await practiceService.submitQuiz({
          deckId,
          totalQuestions: questions.length,
          answers: allAnswers,
        });
        const finalResult = res || defaultResult;
        setResult(finalResult);
        onSessionComplete?.(finalResult);
      } catch {
        setResult(defaultResult);
        onSessionComplete?.(defaultResult);
      }
    }
  }, [currentIndex, questions, deckId, maxCombo, onSessionComplete]);

  const handleAnswerEvaluation = useCallback(
    async (answerOverride?: string) => {
      if (feedbackState !== "IDLE" || !currentQuestion) return;

      const submission =
        answerOverride !== undefined ? answerOverride : typedInput;
      const timeSpentMs = Date.now() - questionStartTimeRef.current;
      const isCorrect = checkAnswer(submission, currentQuestion.word);
      const diff = computeCharacterDiff(submission, currentQuestion.word);

      setCharacterDiff(diff);

      if (isCorrect) {
        setFeedbackState("CORRECT");
        setCurrentCombo((prev) => {
          const next = prev + 1;
          setMaxCombo((m) => Math.max(m, next));
          return next;
        });
      } else {
        setFeedbackState("INCORRECT");
        setCurrentCombo(0);
      }

      const answerRecord: ListeningAnswerSubmissionDto = {
        cardId: currentQuestion.cardId,
        submittedWord: submission,
        isCorrect,
        timeSpentMs,
        hintsUsed: hintLevel,
        replayCount,
        audioSpeedUsed: audioPlayer.playbackSpeed,
      };

      answersRef.current.push(answerRecord);

      advanceTimerRef.current = setTimeout(() => {
        advanceQuestion();
      }, 1200);
    },
    [
      feedbackState,
      currentQuestion,
      typedInput,
      hintLevel,
      replayCount,
      audioPlayer.playbackSpeed,
      advanceQuestion,
    ],
  );

  const submitAnswer = useCallback(
    async (overrideAnswer?: string) => {
      await handleAnswerEvaluation(overrideAnswer);
    },
    [handleAnswerEvaluation],
  );

  const skipToNext = useCallback(() => {
    if (feedbackState !== "IDLE") {
      advanceQuestion();
    }
  }, [feedbackState, advanceQuestion]);

  const triggerHint = useCallback(() => {
    setHintLevel((prev) => {
      if (prev < 3) {
        setIsSpeedBonusEligible(false);
        return prev + 1;
      }
      return prev;
    });
  }, []);

  const replayAudio = useCallback(async () => {
    setReplayCount((prev) => {
      const next = prev + 1;
      if (next > 2) {
        setIsSpeedBonusEligible(false);
      }
      return next;
    });
    await audioPlayer.replayAudio();
  }, [audioPlayer]);

  const toggleSpeed = useCallback(() => {
    audioPlayer.toggleSpeed();
  }, [audioPlayer]);

  const retakeQuiz = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setCurrentIndex(0);
    setTypedInput("");
    setFeedbackState("IDLE");
    setHintLevel(0);
    setReplayCount(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setTimerSeconds(20);
    setIsSpeedBonusEligible(true);
    setCharacterDiff(null);
    setIsCompleted(false);
    setResult(null);
    answersRef.current = [];
  }, []);

  return {
    currentIndex,
    currentQuestion,
    totalQuestions,
    typedInput,
    feedbackState,
    hintLevel,
    replayCount,
    currentCombo,
    maxCombo,
    timerSeconds,
    isSpeedBonusEligible,
    characterDiff,
    isCompleted,
    result,
    audioPlayer,
    setTypedInput,
    submitAnswer,
    skipToNext,
    triggerHint,
    replayAudio,
    toggleSpeed,
    retakeQuiz,
  };
}
