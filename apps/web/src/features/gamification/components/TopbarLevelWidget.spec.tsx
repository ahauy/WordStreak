import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TopbarLevelWidget } from "./TopbarLevelWidget";
import * as useXpSummaryModule from "../hooks/useXpSummary";
import { MasteryTier } from "@wordstreak/shared-types";

describe("TopbarLevelWidget", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders loading skeleton when loading", () => {
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
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      setSummary: vi.fn(),
    });

    render(<TopbarLevelWidget />);
    expect(screen.getByTestId("topbar-level-loading")).toBeDefined();
  });

  it("renders level pill with level number and tier crest", () => {
    vi.spyOn(useXpSummaryModule, "useXpSummary").mockReturnValue({
      summary: {
        userId: "u1",
        totalXp: 450,
        level: 4,
        tier: MasteryTier.BRONZE,
        currentLevelXp: 50,
        nextLevelRequiredXp: 120,
        levelProgressPercent: 41.67,
        todayXp: 30,
        dailyGoalBonusEarnedToday: false,
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
      },
      level: 4,
      tier: MasteryTier.BRONZE,
      totalXp: 450,
      currentLevelXp: 50,
      nextLevelRequiredXp: 120,
      progressPercent: 41.67,
      todayXp: 30,
      dailyGoalBonusEarnedToday: false,
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

    render(<TopbarLevelWidget />);
    const pill = screen.getByTestId("topbar-level-pill");
    expect(pill).toBeDefined();
    expect(screen.getByText("Lv. 4")).toBeDefined();
  });

  it("opens popover on click or hover and displays details", () => {
    const onOpenHistory = vi.fn();

    vi.spyOn(useXpSummaryModule, "useXpSummary").mockReturnValue({
      summary: {
        userId: "u1",
        totalXp: 1250,
        level: 8,
        tier: MasteryTier.SILVER,
        currentLevelXp: 150,
        nextLevelRequiredXp: 250,
        levelProgressPercent: 60,
        todayXp: 50,
        dailyGoalBonusEarnedToday: true,
        nextTier: MasteryTier.GOLD,
        nextTierLevel: 16,
        tierMetadata: {
          tier: MasteryTier.SILVER,
          nameEn: "Silver",
          nameVi: "Bạc",
          minLevel: 6,
          maxLevel: 15,
          colorHex: "#94A3B8",
          badgeIcon: "silver-crest",
        },
      },
      level: 8,
      tier: MasteryTier.SILVER,
      totalXp: 1250,
      currentLevelXp: 150,
      nextLevelRequiredXp: 250,
      progressPercent: 60,
      todayXp: 50,
      dailyGoalBonusEarnedToday: true,
      nextTier: MasteryTier.GOLD,
      nextTierLevel: 16,
      tierMetadata: {
        tier: MasteryTier.SILVER,
        nameEn: "Silver",
        nameVi: "Bạc",
        minLevel: 6,
        maxLevel: 15,
        colorHex: "#94A3B8",
        badgeIcon: "silver-crest",
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      setSummary: vi.fn(),
    });

    render(<TopbarLevelWidget onOpenHistory={onOpenHistory} />);
    const pill = screen.getByTestId("topbar-level-pill");

    fireEvent.click(pill);

    const popover = screen.getByTestId("topbar-level-popover");
    expect(popover).toBeDefined();
    expect(screen.getByText("Hạng Bạc")).toBeDefined();
    expect(screen.getByText("1,250 XP")).toBeDefined();
    expect(screen.getByText("+50 XP")).toBeDefined();

    // Trigger history CTA
    const historyBtn = screen.getByText("Xem lịch sử");
    fireEvent.click(historyBtn);
    expect(onOpenHistory).toHaveBeenCalledTimes(1);
  });
});
