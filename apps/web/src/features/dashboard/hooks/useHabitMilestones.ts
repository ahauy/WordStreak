import { useState, useEffect, useCallback } from "react";
import type { HabitMilestone } from "@wordstreak/shared-types";

export const HABIT_MILESTONES: HabitMilestone[] = [
  {
    id: "words-50",
    targetWords: 50,
    titleKey: "m50.title",
    descKey: "m50.desc",
  },
  {
    id: "words-100",
    targetWords: 100,
    titleKey: "m100.title",
    descKey: "m100.desc",
  },
  {
    id: "words-300",
    targetWords: 300,
    titleKey: "m300.title",
    descKey: "m300.desc",
  },
  {
    id: "words-500",
    targetWords: 500,
    titleKey: "m500.title",
    descKey: "m500.desc",
  },
];

const STORAGE_KEY = "wordstreak_celebrated_milestones";

export function getCelebratedMilestones(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCelebratedMilestone(milestoneId: string): void {
  try {
    const current = getCelebratedMilestones();
    if (!current.includes(milestoneId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, milestoneId]));
    }
  } catch {
    // Graceful ignore
  }
}

export function useHabitMilestones(masteredCount: number) {
  const [activeMilestone, setActiveMilestone] = useState<HabitMilestone | null>(null);

  useEffect(() => {
    if (masteredCount <= 0) return;

    const celebrated = getCelebratedMilestones();
    // Find highest reached milestone that has not been celebrated
    const nextToCelebrate = [...HABIT_MILESTONES]
      .reverse()
      .find((m) => masteredCount >= m.targetWords && !celebrated.includes(m.id));

    if (nextToCelebrate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveMilestone(nextToCelebrate);
    }
  }, [masteredCount]);

  const closeModal = useCallback(() => {
    if (activeMilestone) {
      saveCelebratedMilestone(activeMilestone.id);
      setActiveMilestone(null);
    }
  }, [activeMilestone]);

  return {
    activeMilestone,
    closeModal,
  };
}
