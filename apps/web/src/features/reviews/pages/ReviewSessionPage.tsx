import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReviewSession } from "../hooks/useReviewSession";
import { FlashcardReviewCard } from "../components/FlashcardReviewCard";
import { ReviewProgressBar } from "../components/ReviewProgressBar";
import { ReviewEmptyState } from "../components/ReviewEmptyState";
import { ReviewSummaryModal } from "../components/ReviewSummaryModal";
import { StreakCelebrationModal } from "../../dashboard/components/StreakCelebrationModal";
import { useStreak } from "../../dashboard/hooks/useStreak";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";
import type { StreakActivityResponseDto } from "@wordstreak/shared-types";

export const ReviewSessionPage: React.FC = () => {
  const { id: deckId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { recordActivity } = useStreak({ enabled: false });

  const [celebrationData, setCelebrationData] =
    useState<StreakActivityResponseDto | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const hasRecordedStreakRef = useRef(false);

  const {
    currentCard,
    initialTotal,
    remainingCount,
    isFlipped,
    isLoading,
    isSubmitting,
    isCompleted,
    error,
    sessionStats,
    flip,
    rateCard,
    restartSession: baseRestartSession,
  } = useReviewSession(deckId);

  const restartSession = () => {
    hasRecordedStreakRef.current = false;
    setCelebrationData(null);
    setIsCelebrationOpen(false);
    baseRestartSession();
  };

  // Record streak activity when review completes
  useEffect(() => {
    if (
      isCompleted &&
      sessionStats.totalReviewed > 0 &&
      !hasRecordedStreakRef.current
    ) {
      hasRecordedStreakRef.current = true;
      recordActivity()
        .then((result) => {
          if (result.streakIncreased) {
            setCelebrationData(result);
            setIsCelebrationOpen(true);
          }
        })
        .catch((err) => {
          console.error("Failed to record streak for review session:", err);
        });
    }
  }, [isCompleted, sessionStats.totalReviewed, recordActivity]);

  const completedCount = initialTotal - remainingCount;

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#000000] flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Header / Progress */}
      <header className="w-full">
        {!isLoading && !error && (
          <ReviewProgressBar
            completedCount={completedCount}
            totalCount={initialTotal}
            deckTitle={currentCard?.deckTitle}
            onExit={() =>
              deckId ? navigate(`/decks/${deckId}`) : navigate("/dashboard")
            }
          />
        )}
      </header>

      {/* Main Review Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center my-auto w-full max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-[#737373]">
            <Loader2 className="w-8 h-8 animate-spin text-[#000000]" />
            <span className="text-sm">Preparing your review queue...</span>
          </div>
        ) : error ? (
          <div className="w-full max-w-md p-6 rounded-2xl border border-[#ff5f56]/20 bg-[#fafafa] text-center">
            <AlertCircle className="w-8 h-8 text-[#ff5f56] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#000000] mb-1">
              Could not load cards
            </h3>
            <p className="text-xs text-[#737373] mb-4">{error}</p>
            <button
              type="button"
              onClick={restartSession}
              className="px-4 py-2 rounded-full bg-[#000000] text-[#ffffff] text-xs font-medium inline-flex items-center gap-1.5 hover:bg-[#090909] focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : isCompleted ? (
          sessionStats.totalReviewed > 0 ? (
            <ReviewSummaryModal
              stats={sessionStats}
              onRestart={restartSession}
            />
          ) : (
            <ReviewEmptyState
              deckTitle={deckId ? "this deck" : undefined}
              onRefresh={restartSession}
            />
          )
        ) : currentCard ? (
          <FlashcardReviewCard
            card={currentCard}
            isFlipped={isFlipped}
            isSubmitting={isSubmitting}
            onFlip={flip}
            onRate={rateCard}
          />
        ) : null}
      </main>

      {/* Bottom Footer Guidance */}
      <footer className="w-full py-4 text-center text-xs text-[#737373] border-t border-[#e5e5e5]">
        <span>
          Powered by SuperMemo-2 Spaced Repetition Engine · WordStreak
        </span>
      </footer>

      {/* Streak Celebration Modal */}
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
};
