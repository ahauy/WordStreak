import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StreakCelebrationModal } from "./StreakCelebrationModal";

describe("StreakCelebrationModal Component", () => {
  it("should render celebration modal when isOpen is true", () => {
    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={vi.fn()}
        streakDays={7}
        bestStreak={10}
      />,
    );

    expect(screen.getByText("7 Ngày Streak! 🔥")).toBeDefined();
    expect(screen.getByTestId("milestone-freeze-badge")).toBeDefined();
    expect(screen.getByText("+1 Streak Freeze Earned! 🧊")).toBeDefined();
  });

  it("should display milestone freeze badge when earnedMilestoneFreeze is true", () => {
    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={vi.fn()}
        streakDays={14}
        earnedMilestoneFreeze={true}
      />,
    );

    const badge = screen.getByTestId("milestone-freeze-badge");
    expect(badge).toBeDefined();
    expect(badge.textContent).toContain("+1 Streak Freeze Earned! 🧊");
  });

  it("should not display milestone freeze badge on normal streak day without milestone", () => {
    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={vi.fn()}
        streakDays={3}
        earnedMilestoneFreeze={false}
      />,
    );

    expect(screen.queryByTestId("milestone-freeze-badge")).toBeNull();
  });

  it("should call onClose when action button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <StreakCelebrationModal
        isOpen={true}
        onClose={handleClose}
        streakDays={7}
      />,
    );

    const button = screen.getByRole("button", { name: /Tiếp tục học/i });
    fireEvent.click(button);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
