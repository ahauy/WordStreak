import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StreakHeatmapTracker } from "./StreakHeatmapTracker";
import type { ActivityHeatmapResponseDto } from "@wordstreak/shared-types";

describe("StreakHeatmapTracker Component", () => {
  it("renders clean zero-data state when user has no reviews yet", () => {
    render(
      <StreakHeatmapTracker
        heatmapData={null}
        isLoading={false}
        currentStreak={0}
        longestStreak={0}
      />,
    );

    expect(
      screen.getByText(
        /Chưa có lượt ôn tập nào. Bắt đầu phiên học đầu tiên để ghi nhận chuỗi hoạt động!/i,
      ),
    ).toBeDefined();
    expect(screen.getByText("Streak & Habit Tracker")).toBeDefined();
    expect(screen.getByText("(0/7d)")).toBeDefined();
  });

  it("renders real activity summary when user has review data", () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const mockHeatmapData: ActivityHeatmapResponseDto = {
      days: [
        {
          date: dateStr,
          count: 15,
          level: 3,
        },
      ],
      totalReviews: 15,
      activeDaysCount: 1,
    };

    render(
      <StreakHeatmapTracker
        heatmapData={mockHeatmapData}
        isLoading={false}
        currentStreak={1}
        longestStreak={1}
      />,
    );

    expect(screen.getByText(/15 thẻ/i)).toBeDefined();
    expect(screen.getByText(/1 ngày/i)).toBeDefined();
  });
});
