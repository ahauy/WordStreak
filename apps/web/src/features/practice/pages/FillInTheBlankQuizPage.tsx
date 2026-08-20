import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import type { FillBlankQuestionDto } from "@wordstreak/shared-types";
import { practiceService } from "../services/practiceService";
import { decksService } from "../../decks/services/decksService";
import { useFillBlankQuiz } from "../hooks/useFillBlankQuiz";
import { QuizProgressBar } from "../components/QuizProgressBar";
import { FillBlankInput } from "../components/FillBlankInput";
import { AnagramTilePicker } from "../components/AnagramTilePicker";
import { QuizResultsView } from "../components/QuizResultsView";

export const FillInTheBlankQuizPage: React.FC = () => {
  const { id: deckId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const limitParam = parseInt(searchParams.get("limit") || "10", 10);
  const isZenMode = searchParams.get("zen") === "true";

  const [deckTitle, setDeckTitle] = useState<string>("Sentence Practice");
  const [questions, setQuestions] = useState<FillBlankQuestionDto[]>([]);
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
      .getFillBlankQuiz(deckId, limitParam)
      .then((fbQuestions) => {
        if (ignore) return;
        if (fbQuestions.length === 0) {
          setError(
            "No questions could be generated. Ensure your deck has vocabulary cards.",
          );
        } else {
          setQuestions(fbQuestions);
        }
      })
      .catch((err: unknown) => {
        if (ignore) return;
        console.error("Failed to load fill-in-the-blank quiz:", err);
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
    selectedTileIndices,
    isAnagramMode,
    setIsAnagramMode,
    hintLevel,
    feedbackState,
    timerSeconds,
    currentCombo,
    isCompleted,
    result,
    submitAnswer,
    triggerHint,
    selectAnagramTile,
    removeLastAnagramTile,
    clearAnagramTiles,
    retakeQuiz,
  } = useFillBlankQuiz({
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
    retakeQuiz();
    if (!deckId) return;
    setIsLoading(true);
    setError(null);
    practiceService
      .getFillBlankQuiz(deckId, limitParam)
      .then((fbQuestions) => {
        if (fbQuestions.length === 0) {
          setError(
            "No questions could be generated. Ensure your deck has vocabulary cards.",
          );
        } else {
          setQuestions(fbQuestions);
        }
      })
      .catch((err: unknown) => {
        console.error("Failed to load fill-in-the-blank quiz:", err);
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

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#9333ea] animate-spin mb-3" />
        <p className="text-sm font-mono text-[#737373]">
          Generating fill-in-the-blank questions...
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
            {/* Input & Sentence Card */}
            <FillBlankInput
              question={currentQuestion}
              typedInput={typedInput}
              feedbackState={feedbackState}
              hintLevel={hintLevel}
              isAnagramMode={isAnagramMode}
              onInputChange={setTypedInput}
              onSubmit={() => submitAnswer()}
              onTriggerHint={triggerHint}
              onToggleAnagram={() => setIsAnagramMode(!isAnagramMode)}
            />

            {/* Letter Scramble Tiles (Anagram Mode) */}
            {isAnagramMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2"
              >
                <AnagramTilePicker
                  scrambledLetters={currentQuestion.scrambledLetters}
                  selectedIndices={selectedTileIndices}
                  disabled={feedbackState !== "IDLE"}
                  onSelectTile={selectAnagramTile}
                  onRemoveLast={removeLastAnagramTile}
                  onClear={clearAnagramTiles}
                />
              </motion.div>
            )}

            {/* Hotkey hint bar */}
            <div className="text-center mt-2">
              <span className="text-xs font-mono text-[#a3a3a3]">
                Tip: Press{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-[#e5e5e5] bg-[#fafafa] text-[#737373]">
                  Enter
                </kbd>{" "}
                to submit,{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-[#e5e5e5] bg-[#fafafa] text-[#737373]">
                  Ctrl+H
                </kbd>{" "}
                for hint,{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-[#e5e5e5] bg-[#fafafa] text-[#737373]">
                  Space
                </kbd>{" "}
                to advance
              </span>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};
