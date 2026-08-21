import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StreakFlame } from "./StreakFlame";

describe("StreakFlame Component", () => {
  it("should render flame element with tier 0 (Ashen Ember) when streakDays is 0", () => {
    render(<StreakFlame streakDays={0} />);
    const flameEl = screen.getByTestId("streak-flame");
    expect(flameEl).toBeDefined();
    expect(flameEl.getAttribute("title")).toContain("Tro Tàn Âm Ỉ");
  });

  it("should render Violet Spark tier for streak of 3 days", () => {
    render(<StreakFlame streakDays={3} />);
    const flameEl = screen.getByTestId("streak-flame");
    expect(flameEl.getAttribute("title")).toContain("Tia Lửa Tím");
  });

  it("should render Azure Blaze tier for streak of 10 days", () => {
    render(<StreakFlame streakDays={10} />);
    const flameEl = screen.getByTestId("streak-flame");
    expect(flameEl.getAttribute("title")).toContain("Lửa Lam Plasma");
  });

  it("should render explicit tier when tier prop is provided", () => {
    render(<StreakFlame tier={3} />);
    const flameEl = screen.getByTestId("streak-flame");
    expect(flameEl.getAttribute("title")).toContain("Lửa Lục Bảo");
  });

  it("should display streak count when showCount is true", () => {
    render(
      <StreakFlame streakDays={15} showCount={true} countPosition="right" />,
    );
    const countEl = screen.getByTestId("streak-count-text");
    expect(countEl).toBeDefined();
    expect(countEl.textContent).toBe("15");
  });

  it("should apply grayscale class when streakDays is 0 and no explicit tier is provided", () => {
    const { container } = render(<StreakFlame streakDays={0} />);
    const svgEl = container.querySelector("svg");
    expect(svgEl?.getAttribute("class")).toContain("grayscale");
  });

  it("should NOT apply grayscale class when explicit tier is provided", () => {
    const { container } = render(<StreakFlame tier={2} />);
    const svgEl = container.querySelector("svg");
    expect(svgEl?.getAttribute("class")).not.toContain("grayscale");
  });

  it("should render without crashing for all sizes", () => {
    const sizes = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;
    sizes.forEach((size) => {
      const { unmount } = render(<StreakFlame streakDays={5} size={size} />);
      expect(screen.getByTestId("streak-flame")).toBeDefined();
      unmount();
    });
  });
});
