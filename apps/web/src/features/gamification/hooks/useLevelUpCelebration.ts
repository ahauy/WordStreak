import { useState, useCallback } from "react";
import type { LevelUpEventDto } from "@wordstreak/shared-types";

export function useLevelUpCelebration() {
  const [celebrationData, setCelebrationData] =
    useState<LevelUpEventDto | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const triggerCelebration = useCallback((data: LevelUpEventDto) => {
    if (data.isLevelUp) {
      setCelebrationData(data);
      setIsOpen(true);
    }
  }, []);

  const closeCelebration = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    celebrationData,
    triggerCelebration,
    closeCelebration,
  };
}
