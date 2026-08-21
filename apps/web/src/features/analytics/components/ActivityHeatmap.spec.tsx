import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ActivityHeatmap } from "./ActivityHeatmap";
import type { ActivityHeatmapResponseDto } from "@wordstreak/shared-types";

describe("ActivityHeatmap Component", () => {
  const mockHeatmapData: ActivityHeatmapResponseDto = {
    startDate: "2025-08-21",
    endDate: "2026-08-21",
    totalReviews: 45,
    activeDaysCount: 12,
    longestDailyReviews: 18,
    days: [
      { date: "2026-08-20", count: 0, level: 0 },
      { date: "2026-08-21", count: 18, level: 3 },
    ],
  };

  it("TC-STAT-009: renders heatmap title and review metrics", () => {
    render(<ActivityHeatmap data={mockHeatmapData} />);

    expect(screen.getByText(/Bản đồ nhiệt độ hoạt động/i)).toBeDefined();
    expect(screen.getByText("45")).toBeDefined();
    expect(screen.getByText(/12/i)).toBeDefined();
  });

  it("renders loading skeleton when isLoading is true", () => {
    const { container } = render(
      <ActivityHeatmap data={null} isLoading={true} />,
    );
    expect(container.querySelector(".animate-pulse")).toBeDefined();
  });

  it("shows tooltip on cell hover", () => {
    render(<ActivityHeatmap data={mockHeatmapData} />);

    const cell = screen.getByLabelText("18 thẻ đã ôn ngày 2026-08-21");
    expect(cell).toBeDefined();

    fireEvent.mouseEnter(cell);
    expect(screen.getByText("18 lượt ôn tập")).toBeDefined();

    fireEvent.mouseLeave(cell);
    expect(screen.queryByText("18 lượt ôn tập")).toBeNull();
  });
});
