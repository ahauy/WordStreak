import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MasteryDistributionCard } from "./MasteryDistributionCard";
import type { MasterySummaryDto } from "@wordstreak/shared-types";

describe("MasteryDistributionCard Component", () => {
  const mockMastery: MasterySummaryDto = {
    totalCards: 20,
    masteredCount: 10,
    masteredPercentage: 50.0,
    learningCount: 6,
    learningPercentage: 30.0,
    newCount: 4,
    newPercentage: 20.0,
  };

  it("TC-STAT-010: renders card counts and percentages for Mastered, Learning, New", () => {
    render(<MasteryDistributionCard data={mockMastery} />);

    expect(screen.getByText("20")).toBeDefined(); // total
    expect(screen.getByText("10")).toBeDefined(); // mastered
    expect(screen.getByText("50%")).toBeDefined();
    expect(screen.getByText("6")).toBeDefined(); // learning
    expect(screen.getByText("30%")).toBeDefined();
    expect(screen.getByText("4")).toBeDefined(); // new
    expect(screen.getByText("20%")).toBeDefined();
  });

  it("renders encouraging empty state when totalCards is 0", () => {
    const emptyMastery: MasterySummaryDto = {
      totalCards: 0,
      masteredCount: 0,
      masteredPercentage: 0,
      learningCount: 0,
      learningPercentage: 0,
      newCount: 0,
      newPercentage: 0,
    };

    render(<MasteryDistributionCard data={emptyMastery} />);
    expect(screen.getByText("Chưa có thẻ từ vựng nào")).toBeDefined();
  });
});
