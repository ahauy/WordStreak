import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import type {
  MatchingQuizResponseDto,
  StreakActivityResponseDto,
} from "@wordstreak/shared-types";
import { practiceService } from "../services/practiceService";
import { decksService } from "../../decks/services/decksService";
import { useWebAudioSynthesizer } from "../hooks/useWebAudioSynthesizer";
import { useMatchingGameEngine } from "../hooks/useMatchingGameEngine";
import { MatchingProgressBar } from "../components/MatchingProgressBar";
import { MatchingGameBoard } from "../components/MatchingGameBoard";
import { QuizResultsView } from "../components/QuizResultsView";
import { StreakCelebrationModal } from "../../dashboard/components/StreakCelebrationModal";
import { useStreak } from "../../dashboard/hooks/useStreak";

export const WordMatchingPage: React.FC = () => {
  const { id: deckId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { recordActivity } = useStreak({ enabled: false });

  const limitParam = parseInt(searchParams.get("limit") || "10", 10);
  const isZenMode = searchParams.get("zen") === "true";

  const [deckTitle, setDeckTitle] = useState<string>("Nối từ vựng");
  const [quizData, setQuizData] = useState<MatchingQuizResponseDto | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [celebrationData, setCelebrationData] =
    useState<StreakActivityResponseDto | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const hasRecordedStreakRef = useRef(false);

  const synthesizer = useWebAudioSynthesizer();

  useEffect(() => {
    if (!deckId) return;

    let ignore = false;

    Promise.all([
      decksService.getDeck(deckId).catch(() => null),
      practiceService.getMatchingQuiz(deckId, limitParam),
    ])
      .then(([deckRes, quizRes]) => {
        if (ignore) return;
        if (deckRes?.title) {
          setDeckTitle(deckRes.title);
        }

        if (!quizRes || !quizRes.rounds || quizRes.rounds.length === 0) {
          setError(
            "Không thể tạo phiên nối từ. Vui lòng đảm bảo bộ thẻ có tối thiểu 5 thẻ từ vựng.",
          );
        } else {
          setQuizData(quizRes);
        }
      })
      .catch((err: unknown) => {
        if (ignore) return;
        console.error("Failed to load matching quiz:", err);
        const errMsg =
          err instanceof Error
            ? err.message
            : "Không thể tải phiên nối từ. Vui lòng thử lại sau.";
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
    currentRoundIndex,
    totalRounds,
    wordTiles,
    meaningTiles,
    tileStates,
    selectedTileId,
    currentCombo,
    matchedPairsCount,
    totalPairsCount,
    roundMatchedPairsCount,
    timerSeconds,
    isLocked,
    isCompleted,
    result,
    handleSelectTile,
    handleRestart,
  } = useMatchingGameEngine({
    rounds: quizData?.rounds || [],
    deckId: deckId || "",
    isZenMode,
    synthesizer,
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
    handleRestart();
    if (!deckId) return;
    setIsLoading(true);
    setError(null);
    practiceService
      .getMatchingQuiz(deckId, limitParam)
      .then((quizRes) => {
        if (!quizRes || !quizRes.rounds || quizRes.rounds.length === 0) {
          setError(
            "Không thể tạo phiên nối từ. Vui lòng đảm bảo bộ thẻ có tối thiểu 5 thẻ từ vựng.",
          );
        } else {
          setQuizData(quizRes);
        }
      })
      .catch((err: unknown) => {
        console.error("Failed to load matching quiz:", err);
        const errMsg =
          err instanceof Error
            ? err.message
            : "Không thể tải phiên nối từ. Vui lòng thử lại sau.";
        setError(errMsg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Play audio pronunciation for words
  const handlePlayAudio = (audioUrl: string) => {
    if (!audioUrl) return;
    try {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => null);
    } catch {
      // Ignore audio error
    }
  };

  // Record streak on completion
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
          console.error("Failed to record streak for matching quiz:", err);
        });
    }
  }, [isCompleted, result, recordActivity]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#9333ea] animate-spin mb-3" />
        <p className="text-sm font-mono text-[#737373]">
          Đang chuẩn bị phiên nối từ (Preparing word matching session)...
        </p>
      </div>
    );
  }

  // Error State
  if (error || !quizData || quizData.rounds.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-full bg-[#fef2f2] border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold font-display text-[#000000] mb-2">
          Unable to Start Practice
        </h2>
        <p className="text-sm text-[#737373] max-w-md mb-6 leading-relaxed">
          {error ||
            "Chế độ nối từ yêu cầu tối thiểu 5 thẻ từ vựng trong bộ thẻ."}
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
      {/* Top Header Progress Bar */}
      <MatchingProgressBar
        currentRoundIndex={currentRoundIndex}
        totalRounds={totalRounds}
        matchedPairsCount={matchedPairsCount}
        totalPairsCount={totalPairsCount}
        roundMatchedCount={roundMatchedPairsCount}
        roundTotalCount={wordTiles.length || 5}
        timerSeconds={timerSeconds}
        isZenMode={isZenMode}
        currentCombo={currentCombo}
        isMuted={synthesizer.isMuted}
        onToggleMute={synthesizer.toggleMute}
        onExit={handleBackToDeck}
        deckTitle={deckTitle}
      />

      {/* Main Interactive Matching Board */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-4 sm:py-8 max-w-4xl mx-auto w-full">
        <motion.div
          key={`round_${currentRoundIndex}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full"
        >
          <MatchingGameBoard
            wordTiles={wordTiles}
            meaningTiles={meaningTiles}
            tileStates={tileStates}
            selectedTileId={selectedTileId}
            onSelectTile={handleSelectTile}
            onPlayAudio={handlePlayAudio}
            isLocked={isLocked}
            onToggleMute={synthesizer.toggleMute}
            onExit={handleBackToDeck}
          />
        </motion.div>

        {/* Hotkey Guide Bar */}
        <div className="text-center mt-6">
          <span className="text-xs font-mono text-[#a3a3a3]">
            Phím tắt:{" "}
            <kbd className="px-1.5 py-0.5 rounded border border-[#e5e5e5] bg-[#fafafa] text-[#737373]">
              1-5
            </kbd>{" "}
            Cột từ vựng,{" "}
            <kbd className="px-1.5 py-0.5 rounded border border-[#e5e5e5] bg-[#fafafa] text-[#737373]">
              Q-T
            </kbd>{" "}
            Cột định nghĩa,{" "}
            <kbd className="px-1.5 py-0.5 rounded border border-[#e5e5e5] bg-[#fafafa] text-[#737373]">
              Space
            </kbd>{" "}
            Âm thanh,{" "}
            <kbd className="px-1.5 py-0.5 rounded border border-[#e5e5e5] bg-[#fafafa] text-[#737373]">
              Esc
            </kbd>{" "}
            Thoát
          </span>
        </div>
      </main>
    </div>
  );
};
