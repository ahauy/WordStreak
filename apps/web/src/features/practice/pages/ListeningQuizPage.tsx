import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import type {
  ListeningQuestionDto,
  StreakActivityResponseDto,
} from "@wordstreak/shared-types";
import { practiceService } from "../services/practiceService";
import { decksService } from "../../decks/services/decksService";
import { useListeningQuiz } from "../hooks/useListeningQuiz";
import { QuizProgressBar } from "../components/QuizProgressBar";
import { ListeningQuizCard } from "../components/ListeningQuizCard";
import { QuizResultsView } from "../components/QuizResultsView";
import { StreakCelebrationModal } from "../../dashboard/components/StreakCelebrationModal";
import { useStreak } from "../../dashboard/hooks/useStreak";

export const ListeningQuizPage: React.FC = () => {
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

  const [deckTitle, setDeckTitle] = useState<string>("Listening & Typing");
  const [questions, setQuestions] = useState<ListeningQuestionDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch deck info & questions on mount
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
      .getListeningQuiz(deckId, limitParam)
      .then((lqQuestions) => {
        if (ignore) return;
        if (lqQuestions.length === 0) {
          setError(
            "No listening questions could be generated. Ensure your deck has vocabulary cards.",
          );
        } else {
          setQuestions(lqQuestions);
        }
      })
      .catch((err: unknown) => {
        if (ignore) return;
        console.error("Failed to load listening quiz:", err);
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
    typedInput,
    setTypedInput,
    feedbackState,
    hintLevel,
    replayCount,
    timerSeconds,
    currentCombo,
    isCompleted,
    result,
    characterDiff,
    audioPlayer,
    submitAnswer,
    skipToNext,
    triggerHint,
    replayAudio,
    toggleSpeed,
    retakeQuiz,
  } = useListeningQuiz({
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
      .getListeningQuiz(deckId, limitParam)
      .then((lqQuestions) => {
        if (lqQuestions.length === 0) {
          setError(
            "No listening questions could be generated. Ensure your deck has vocabulary cards.",
          );
        } else {
          setQuestions(lqQuestions);
        }
      })
      .catch((err: unknown) => {
        console.error("Failed to load listening quiz:", err);
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

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        triggerHint();
      } else if (e.shiftKey && e.code === "Space") {
        e.preventDefault();
        toggleSpeed();
      } else if (
        feedbackState !== "IDLE" &&
        (e.key === "Enter" || e.code === "Space")
      ) {
        e.preventDefault();
        skipToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerHint, toggleSpeed, feedbackState, skipToNext]);

  // Record streak activity when practice completes
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
          console.error("Failed to record streak for listening quiz:", err);
        });
    }
  }, [isCompleted, result, recordActivity]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#9333ea] animate-spin mb-3" />
        <p className="text-sm font-mono text-[#737373]">
          Đang tạo câu hỏi nghe & viết (Generating listening questions)...
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
          Unable to Start Practice
        </h2>
        <p className="text-sm text-[#737373] max-w-md mb-6 leading-relaxed">
          {error || "Not enough vocabulary cards available for this deck."}
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

  // Results State
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header & Progress */}
      <QuizProgressBar
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        timerSeconds={timerSeconds}
        isZenMode={isZenMode}
        currentCombo={currentCombo}
        deckTitle={deckTitle}
        onExit={handleBackToDeck}
      />

      {/* Main Interactive Practice Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 max-w-2xl mx-auto w-full">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex flex-col gap-6"
          >
            {/* Listening & Typing Card */}
            <ListeningQuizCard
              question={currentQuestion}
              typedInput={typedInput}
              feedbackState={feedbackState}
              hintLevel={hintLevel}
              replayCount={replayCount}
              playbackSpeed={audioPlayer.playbackSpeed}
              isPlayingAudio={audioPlayer.isPlaying}
              needsUserGesture={audioPlayer.needsUserGesture}
              characterDiff={characterDiff}
              onInputChange={setTypedInput}
              onSubmit={() => submitAnswer()}
              onReplayAudio={replayAudio}
              onToggleSpeed={toggleSpeed}
              onTriggerHint={triggerHint}
              onUnlockAudio={() => audioPlayer.unlockAudio()}
            />

            {/* Hotkey hint bar */}
            <div className="text-center mt-2">
              <span className="text-xs font-mono text-[#a3a3a3]">
                Phím tắt:{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-[#e5e5e5] bg-[#fafafa] text-[#737373]">
                  Enter
                </kbd>{" "}
                xác nhận,{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-[#e5e5e5] bg-[#fafafa] text-[#737373]">
                  Ctrl+H
                </kbd>{" "}
                gợi ý,{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-[#e5e5e5] bg-[#fafafa] text-[#737373]">
                  Shift+Space
                </kbd>{" "}
                tốc độ phát
              </span>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};
