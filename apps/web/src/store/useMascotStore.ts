import { create } from "zustand";

interface MascotState {
  isFlameNurtureOpen: boolean;
  feedingTrigger: { id: number; wordCount: number } | null;
  openFlameNurture: () => void;
  closeFlameNurture: () => void;
  triggerFeedWood: (wordCount?: number) => void;
  clearFeedingTrigger: () => void;
}

export const useMascotStore = create<MascotState>((set) => ({
  isFlameNurtureOpen: false,
  feedingTrigger: null,

  openFlameNurture: () => set({ isFlameNurtureOpen: true }),
  closeFlameNurture: () => set({ isFlameNurtureOpen: false }),

  triggerFeedWood: (wordCount = 5) =>
    set({
      feedingTrigger: {
        id: Date.now(),
        wordCount,
      },
    }),

  clearFeedingTrigger: () => set({ feedingTrigger: null }),
}));
