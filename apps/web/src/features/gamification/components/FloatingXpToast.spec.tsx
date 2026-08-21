import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { FloatingXpToast } from "./FloatingXpToast";
import { XpActionType } from "@wordstreak/shared-types";

describe("FloatingXpToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders earned XP amount properly", () => {
    render(<FloatingXpToast xpEarned={10} />);
    const toast = screen.getByTestId("floating-xp-toast");
    expect(toast).toBeDefined();
    expect(screen.getByText("+10 XP")).toBeDefined();
  });

  it("renders bonus breakdown items when provided", () => {
    render(
      <FloatingXpToast
        xpEarned={60}
        breakdown={[
          { type: XpActionType.CARD_REVIEW, xp: 10 },
          {
            type: XpActionType.DAILY_GOAL_COMPLETED,
            xp: 50,
            description: "Mục tiêu ngày!",
          },
        ]}
      />,
    );

    expect(screen.getByText("+60 XP")).toBeDefined();
    const bonusItems = screen.getAllByTestId("floating-xp-bonus-item");
    expect(bonusItems.length).toBe(1);
    expect(screen.getByText("Mục tiêu ngày! (+50 XP)")).toBeDefined();
  });

  it("calls onComplete callback after durationMs", () => {
    const onComplete = vi.fn();
    render(
      <FloatingXpToast
        xpEarned={15}
        durationMs={1000}
        onComplete={onComplete}
      />,
    );

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does not render when xpEarned is 0 and breakdown is empty", () => {
    const { container } = render(<FloatingXpToast xpEarned={0} />);
    expect(container.firstChild).toBeNull();
  });
});
