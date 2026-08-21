import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { XpHistoryDrawer } from "./XpHistoryDrawer";
import * as useXpSummaryModule from "../hooks/useXpSummary";
import * as useXpHistoryModule from "../hooks/useXpHistory";
import { MasteryTier, XpActionType } from "@wordstreak/shared-types";

describe("XpHistoryDrawer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders summary banner and empty state when logs are empty", () => {
    vi.spyOn(useXpSummaryModule, "useXpSummary").mockReturnValue({
      summary: null,
      level: 1,
      tier: MasteryTier.BRONZE,
      totalXp: 0,
      currentLevelXp: 0,
      nextLevelRequiredXp: 100,
      progressPercent: 0,
      todayXp: 0,
      dailyGoalBonusEarnedToday: false,
      nextTier: MasteryTier.SILVER,
      nextTierLevel: 6,
      tierMetadata: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      setSummary: vi.fn(),
    });

    vi.spyOn(useXpHistoryModule, "useXpHistory").mockReturnValue({
      logs: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      page: 1,
      limit: 10,
      activityType: undefined,
      isLoading: false,
      error: null,
      setPage: vi.fn(),
      setLimit: vi.fn(),
      setActivityType: vi.fn(),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      refetch: vi.fn(),
    });

    render(<XpHistoryDrawer />);
    expect(screen.getByTestId("xp-history-drawer")).toBeDefined();
    expect(screen.getByText("Chưa có hoạt động nào")).toBeDefined();
  });

  it("renders list of activity logs with badges and handles filtering", () => {
    const setActivityType = vi.fn();

    vi.spyOn(useXpSummaryModule, "useXpSummary").mockReturnValue({
      summary: null,
      level: 5,
      tier: MasteryTier.BRONZE,
      totalXp: 500,
      currentLevelXp: 50,
      nextLevelRequiredXp: 100,
      progressPercent: 50,
      todayXp: 60,
      dailyGoalBonusEarnedToday: true,
      nextTier: MasteryTier.SILVER,
      nextTierLevel: 6,
      tierMetadata: {
        tier: MasteryTier.BRONZE,
        nameEn: "Bronze",
        nameVi: "Đồng",
        minLevel: 1,
        maxLevel: 5,
        colorHex: "#B45309",
        badgeIcon: "bronze-crest",
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      setSummary: vi.fn(),
    });

    vi.spyOn(useXpHistoryModule, "useXpHistory").mockReturnValue({
      logs: [
        {
          id: "log-1",
          activityType: XpActionType.CARD_REVIEW,
          xpEarned: 10,
          metadata: null,
          createdAt: "2026-08-21T10:00:00.000Z",
        },
        {
          id: "log-2",
          activityType: XpActionType.DAILY_GOAL_COMPLETED,
          xpEarned: 50,
          metadata: null,
          createdAt: "2026-08-21T10:05:00.000Z",
        },
      ],
      meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
      page: 1,
      limit: 10,
      activityType: undefined,
      isLoading: false,
      error: null,
      setPage: vi.fn(),
      setLimit: vi.fn(),
      setActivityType,
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      refetch: vi.fn(),
    });

    render(<XpHistoryDrawer />);
    const list = screen.getByTestId("xp-activity-list");
    expect(list).toBeDefined();

    const items = screen.getAllByTestId("xp-activity-item");
    expect(items.length).toBe(2);
    expect(screen.getByText("Ôn tập thẻ từ vựng")).toBeDefined();
    expect(screen.getByText("Hoàn thành mục tiêu ngày")).toBeDefined();
    expect(screen.getByText("+10 XP")).toBeDefined();
    expect(screen.getByText("+50 XP")).toBeDefined();

    // Click filter pill
    const goalFilterBtn = screen.getByText("Mục tiêu ngày");
    fireEvent.click(goalFilterBtn);
    expect(setActivityType).toHaveBeenCalledWith(
      XpActionType.DAILY_GOAL_COMPLETED,
    );
  });
});
