import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AnalyticsPage } from "./AnalyticsPage";
import * as useAnalyticsHook from "../hooks/useAnalytics";

describe("AnalyticsPage Component", () => {
  beforeEach(() => {
    vi.spyOn(useAnalyticsHook, "useAnalytics").mockReturnValue({
      overview: {
        masterySummary: {
          totalCards: 15,
          masteredCount: 5,
          masteredPercentage: 33.3,
          learningCount: 7,
          learningPercentage: 46.7,
          newCount: 3,
          newPercentage: 20.0,
        },
        retentionRate30Days: 92.5,
        totalReviewsLogged: 120,
        currentStreak: 5,
        bestStreak: 12,
      },
      heatmap: {
        startDate: "2025-08-21",
        endDate: "2026-08-21",
        totalReviews: 120,
        activeDaysCount: 25,
        longestDailyReviews: 20,
        days: [],
      },
      decksProgress: [
        {
          deckId: "deck-1",
          deckTitle: "IELTS Band 7.5",
          deckColor: "#6366F1",
          totalCards: 15,
          masteredCards: 5,
          remainingCards: 10,
          dailyVelocity: 5,
          estimatedDaysToComplete: 2,
          projectedCompletionDate: "2026-08-23T00:00:00.000Z",
          isCompleted: false,
        },
      ],
      deckMastery: {
        totalCards: 15,
        masteredCount: 5,
        masteredPercentage: 33.3,
        learningCount: 7,
        learningPercentage: 46.7,
        newCount: 3,
        newPercentage: 20.0,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("TC-STAT-011: renders page title, hero stats, heatmap, and deck forecast table", () => {
    render(
      <BrowserRouter>
        <AnalyticsPage />
      </BrowserRouter>,
    );

    expect(
      screen.getByText(
        /Learning Analytics & Reports|Báo cáo & Thống kê học tập/i,
      ),
    ).toBeDefined();
    expect(screen.getByText("92.5%")).toBeDefined(); // retention rate
    expect(screen.getAllByText("120").length).toBeGreaterThan(0); // total reviews
    expect(screen.getByText("IELTS Band 7.5")).toBeDefined(); // deck progress
  });
});
