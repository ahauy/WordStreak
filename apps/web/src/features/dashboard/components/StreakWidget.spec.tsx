import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StreakWidget } from "./StreakWidget";

describe("StreakWidget Component (TC-FREEZE-006)", () => {
  it("should render frost shield badge with current freeze count (1/2 🧊)", () => {
    render(
      <StreakWidget
        currentStreak={5}
        streakFreezes={1}
        maxStreakFreezes={2}
        longestStreak={10}
      />,
    );

    const freezeBadge = screen.getByTestId("streak-freeze-badge");
    expect(freezeBadge).toBeDefined();
    expect(freezeBadge.textContent).toContain("1/2 🧊");
  });

  it("should render 2/2 freezes when user is at max capacity", () => {
    render(
      <StreakWidget currentStreak={7} streakFreezes={2} maxStreakFreezes={2} />,
    );

    const freezeBadge = screen.getByTestId("streak-freeze-badge");
    expect(freezeBadge.textContent).toContain("2/2 🧊");
  });

  it("should render 0/2 freezes when all freezes are consumed", () => {
    render(
      <StreakWidget currentStreak={3} streakFreezes={0} maxStreakFreezes={2} />,
    );

    const freezeBadge = screen.getByTestId("streak-freeze-badge");
    expect(freezeBadge.textContent).toContain("0/2 🧊");
  });

  it("should display streak count and best streak", () => {
    render(
      <StreakWidget
        currentStreak={14}
        longestStreak={20}
        streakFreezes={1}
        maxStreakFreezes={2}
      />,
    );

    const countEl = screen.getByTestId("streak-days-count");
    expect(countEl.textContent).toBe("14");
    expect(screen.getByText(/Best: 20d/i)).toBeDefined();
  });

  it("should include hover tooltip explaining streak freeze protection", () => {
    render(
      <StreakWidget currentStreak={5} streakFreezes={1} maxStreakFreezes={2} />,
    );

    const tooltipEl = screen.getByTestId("streak-freeze-tooltip");
    expect(tooltipEl.textContent).toContain(
      "Streak Freeze: Automatically protects your streak if you miss a day. Holds up to 2 freezes.",
    );
  });

  it("should call onOpenFlameNurture when flame icon is clicked", () => {
    const handleOpenFlameNurture = vi.fn();
    render(
      <StreakWidget
        currentStreak={5}
        onOpenFlameNurture={handleOpenFlameNurture}
      />,
    );

    const nurtureButton = screen.getByLabelText("Mở khu vườn nuôi lửa streak");
    fireEvent.click(nurtureButton);

    expect(handleOpenFlameNurture).toHaveBeenCalledTimes(1);
  });
});
