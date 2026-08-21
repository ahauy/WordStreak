import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { useMascotStore } from "../../../store/useMascotStore";
import { useStreak } from "../hooks/useStreak";
import { DraggableFlameMascot } from "./DraggableFlameMascot";
import { FlameNurtureModal } from "./FlameNurtureModal";
import { StreakSavedModal } from "./StreakSavedModal";

export const GlobalFlameMascot: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    isFlameNurtureOpen,
    openFlameNurture,
    closeFlameNurture,
    feedingTrigger,
    triggerFeedWood,
  } = useMascotStore();

  const {
    currentStreak,
    bestStreak,
    streakFreezes,
    maxStreakFreezes,
    wasProtectedByFreeze,
    dismissFreezeSavedNotice,
  } = useStreak({ enabled: !!user });

  if (!user) {
    return null;
  }

  const handleStartReview = () => {
    closeFlameNurture();
    navigate("/review");
  };

  const handleFeedWood = (count: number) => {
    triggerFeedWood(count);
  };

  return (
    <>
      {/* Draggable Streak Flame Mascot Available on All In-App Pages */}
      <DraggableFlameMascot
        currentStreak={currentStreak}
        onOpenFlameNurture={openFlameNurture}
        feedingTrigger={feedingTrigger}
      />

      {/* Flame Evolution & Nurture Modal */}
      <FlameNurtureModal
        isOpen={isFlameNurtureOpen}
        onClose={closeFlameNurture}
        currentStreak={currentStreak}
        longestStreak={bestStreak}
        cardsFedToday={0}
        dailyGoal={user.dailyGoal || 10}
        onStartReview={handleStartReview}
        onFeedWood={handleFeedWood}
      />

      {/* Streak Freeze Auto-Protection Modal */}
      <StreakSavedModal
        isOpen={wasProtectedByFreeze}
        onClose={dismissFreezeSavedNotice}
        streakDays={currentStreak}
        streakFreezes={streakFreezes}
        maxStreakFreezes={maxStreakFreezes}
      />
    </>
  );
};
