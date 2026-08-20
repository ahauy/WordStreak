import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import type {
  QuizQuestionDto,
  StreakActivityResponseDto,
} from "@wordstreak/shared-types";
import { practiceService } from "../services/practiceService";
import { decksService } from "../../decks/services/decksService";
import { useQuizEngine } from "../hooks/useQuizEngine";
import { QuizProgressBar } from "../components/QuizProgressBar";
import { QuizQuestionCard } from "../components/QuizQuestionCard";
import { QuizOptionButton } from "../components/QuizOptionButton";
import { QuizResultsView } from "../components/QuizResultsView";
import { StreakCelebrationModal } from "../../dashboard/components/StreakCelebrationModal";
import { useStreak } from "../../dashboard/hooks/useStreak";

export const MultipleChoiceQuizPage: React.FC = () => {
  const { id: deckId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { recordActivity } = useStreak({ enabled: false });

  const [celebrationData, setCelebrationData] =
    useState<StreakActivityResponseDto | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const hasRecordedStreakRef = useRef(false);

  const limitParam = parseInt(searchParams.get("limit") || "10", 10);
  const isZenMode = searchParams.get("zen") === "true";

  const [deckTitle, setDeckTitle] = useState<string>("Deck Practice");
  const [questions, setQuestions] = useState<QuizQuestionDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch deck info & questions on mount or param change
  useEffect(() => {
    if (!deckId) return;

    let ignore = false;

    decksService
      .getDeck(deckId)
      .then((deckRes) => {
        if (!ignore && deckRes?.title) {
          setDeckTitle(deckRes.title);
        }
      })
      .catch(() => null);

    practiceService
      .getMultipleChoiceQuiz(deckId, limitParam)
      .then((quizQuestions) => {
        if (ignore) return;
        if (quizQuestions.length === 0) {
          setError(
            "No questions could be generated. Ensure your deck has vocabulary cards.",
          );
        } else {
          setQuestions(quizQuestions);
        }
      })
      .catch((err: unknown) => {
        if (ignore) return;
        console.error("Failed to load quiz:", err);
        const errMsg =
          err instanceof Error
            ? err.message
            : "Failed to load quiz session. Please try again.";
        setError(errMsg);
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [deckId, limitParam]);

  const {
    currentIndex,
    currentQuestion,
    totalQuestions,
    selectedOptionId,
    feedbackState,
    timerSeconds,
    currentCombo,
    isCompleted,
    result,
    selectOption,
    retakeQuiz,
  } = useQuizEngine({
    questions,
    deckId: deckId || "",
    isZenMode,
  });

  const handleBackToDeck = () => {
    if (deckId) {
      navigate(`/decks/${deckId}`);
    } else {
      navigate("/decks");
    }
  };

  const handleRetake = () => {
    hasRecordedStreakRef.current = false;
    setCelebrationData(null);
    setIsCelebrationOpen(false);
    retakeQuiz();
    if (!deckId) return;
    setIsLoading(true);
    setError(null);
    practiceService
      .getMultipleChoiceQuiz(deckId, limitParam)
      .then((quizQuestions) => {
        if (quizQuestions.length === 0) {
          setError(
            "No questions could be generated. Ensure your deck has vocabulary cards.",
          );
        } else {
          setQuestions(quizQuestions);
        }
      })
      .catch((err: unknown) => {
        console.error("Failed to load quiz:", err);
        const errMsg =
          err instanceof Error
            ? err.message
            : "Failed to load quiz session. Please try again.";
        setError(errMsg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Record streak activity when quiz completes
  useEffect(() => {
    if (isCompleted && result && !hasRecordedStreakRef.current) {
      hasRecordedStreakRef.current = true;
      recordActivity()
        .then((actResult) => {
          if (actResult.streakIncreased) {
            setCelebrationData(actResult);
            setIsCelebrationOpen(true);
          }
        })
        .catch((err) => {
          console.error("Failed to record streak for quiz session:", err);
        });
    }
  }, [isCompleted, result, recordActivity]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#9333ea] animate-spin mb-3" />
        <p className="text-sm font-mono text-[#737373]">
          Generating multiple choice quiz...
        </p>
      </div>
    );
  }

  // Error State
  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-full bg-[#fef2f2] border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold font-display text-[#000000] mb-2">
          Unable to Start Quiz
        </h2>
        <p className="text-sm text-[#737373] max-w-md mb-6 leading-relaxed">
          {error || "Not enough questions available for this deck."}
        </p>
        <button
          onClick={handleBackToDeck}
          type="button"
          className="px-6 py-2.5 rounded-full bg-[#000000] text-white text-sm font-medium hover:bg-[#171717] transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deck
        </button>
      </div>
    );
  }

  // Completed / Results State
  if (isCompleted && result) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center py-10">
        <QuizResultsView
          result={result}
          onRetake={handleRetake}
          onBackToDeck={handleBackToDeck}
        />

        {celebrationData && (
          <StreakCelebrationModal
            isOpen={isCelebrationOpen}
            onClose={() => setIsCelebrationOpen(false)}
            streakDays={celebrationData.currentStreak}
            bestStreak={celebrationData.bestStreak}
            flameTier={celebrationData.flameTier}
            message={celebrationData.message}
            isNewBest={
              celebrationData.currentStreak >= celebrationData.bestStreak
            }
          />
        )}
      </div>
    );
  }

  const hotkeys = ["1", "2", "3", "4"];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Header & Progress */}
      <QuizProgressBar
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        timerSeconds={timerSeconds}
        isZenMode={isZenMode}
        currentCombo={currentCombo}
        deckTitle={deckTitle}
        onExit={handleBackToDeck}
      />

      {/* Main Interactive Play Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 max-w-2xl mx-auto w-full">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex flex-col gap-6 sm:gap-8"
          >
            {/* Question Card */}
            <QuizQuestionCard question={currentQuestion} />

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {currentQuestion.options.map((option, idx) => (
                <QuizOptionButton
                  key={option.id}
                  option={option}
                  index={idx}
                  hotkey={hotkeys[idx] || `${idx + 1}`}
                  isSelected={selectedOptionId === option.id}
                  feedbackState={feedbackState}
                  disabled={feedbackState !== "IDLE"}
                  onClick={() => selectOption(option.id)}
                />
              ))}
            </div>

            {/* Hotkey hint bar */}
            <div className="text-center">
              <span className="text-xs font-mono text-[#a3a3a3]">
                Tip: Press{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-[#e5e5e5] bg-[#fafafa] text-[#737373]">
                  1-4
                </kbd>{" "}
                to select,{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-[#e5e5e5] bg-[#fafafa] text-[#737373]">
                  Space
                </kbd>{" "}
                to skip pause
              </span>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};
