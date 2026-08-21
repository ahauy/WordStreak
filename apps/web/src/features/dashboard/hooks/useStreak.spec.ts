import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useStreak } from "./useStreak";
import { streakService, notifyStreakUpdated } from "../services/streakService";
import type {
  UserStreakDto,
  StreakActivityResponseDto,
} from "@wordstreak/shared-types";

describe("useStreak", () => {
  const mockStreakData: UserStreakDto = {
    userId: "u-123",
    currentStreak: 5,
    bestStreak: 10,
    lastActiveDate: "2026-08-20T00:00:00Z",
    isActiveToday: true,
    isPendingToday: false,
    timezone: "Asia/Ho_Chi_Minh",
    flameTier: 1,
  };

  const mockActivityResponse: StreakActivityResponseDto = {
    currentStreak: 6,
    bestStreak: 10,
    streakIncreased: true,
    isActiveToday: true,
    flameTier: 1,
    message: "Streak extended to 6 days!",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch streak on mount when enabled is true", async () => {
    vi.spyOn(streakService, "getStreak").mockResolvedValueOnce(mockStreakData);

    const { result } = renderHook(() => useStreak({ enabled: true }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.streak).toEqual(mockStreakData);
    expect(result.current.currentStreak).toBe(5);
    expect(result.current.bestStreak).toBe(10);
    expect(result.current.isActiveToday).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("should not fetch streak on mount when enabled is false", () => {
    const getStreakSpy = vi.spyOn(streakService, "getStreak");

    const { result } = renderHook(() => useStreak({ enabled: false }));

    expect(getStreakSpy).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.streak).toBeNull();
  });

  it("should record activity and update streak state", async () => {
    vi.spyOn(streakService, "getStreak").mockResolvedValueOnce(mockStreakData);
    vi.spyOn(streakService, "recordActivity").mockResolvedValueOnce(
      mockActivityResponse,
    );

    const { result } = renderHook(() => useStreak({ enabled: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let actRes: StreakActivityResponseDto | undefined;
    await act(async () => {
      actRes = await result.current.recordActivity();
    });

    expect(actRes).toEqual(mockActivityResponse);
    expect(result.current.currentStreak).toBe(6);
    expect(result.current.bestStreak).toBe(10);
    expect(result.current.isActiveToday).toBe(true);
  });

  it("should update state when wordstreak:streak-updated event is dispatched", async () => {
    vi.spyOn(streakService, "getStreak").mockResolvedValueOnce(mockStreakData);

    const { result } = renderHook(() => useStreak({ enabled: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentStreak).toBe(5);

    // Dispatch custom event with activityResult
    act(() => {
      notifyStreakUpdated({
        activityResult: {
          currentStreak: 7,
          bestStreak: 12,
          streakIncreased: true,
          isActiveToday: true,
          flameTier: 2,
          message: "Level up!",
        },
      });
    });

    expect(result.current.currentStreak).toBe(7);
    expect(result.current.bestStreak).toBe(12);
    expect(result.current.flameTier).toBe(2);
  });

  it("should expose streak freeze properties and allow dismissing freeze notice", async () => {
    const mockFreezeData: UserStreakDto = {
      ...mockStreakData,
      streakFreezes: 1,
      maxStreakFreezes: 2,
      wasProtectedByFreeze: true,
    };
    vi.spyOn(streakService, "getStreak").mockResolvedValueOnce(mockFreezeData);

    const { result } = renderHook(() => useStreak({ enabled: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.streakFreezes).toBe(1);
    expect(result.current.maxStreakFreezes).toBe(2);
    expect(result.current.wasProtectedByFreeze).toBe(true);

    // Dismiss notice
    act(() => {
      result.current.dismissFreezeSavedNotice();
    });

    expect(result.current.wasProtectedByFreeze).toBe(false);
    expect(result.current.streak?.wasProtectedByFreeze).toBe(false);
  });

  it("should handle error when getStreak fails", async () => {
    vi.spyOn(streakService, "getStreak").mockRejectedValueOnce(
      new Error("Network Error"),
    );

    const { result } = renderHook(() => useStreak({ enabled: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network Error");
    expect(result.current.streak).toBeNull();
  });
});
