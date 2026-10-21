import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HabitMilestoneModal } from "../HabitMilestoneModal";
import type { HabitMilestone } from "@wordstreak/shared-types";

describe("HabitMilestoneModal (US-LIB-16 / TC-LIB-16-004)", () => {
  const mockMilestone50: HabitMilestone = {
    id: "words-50",
    targetWords: 50,
    titleKey: "m50.title",
    descKey: "m50.desc",
  };

  const mockMilestone100: HabitMilestone = {
    id: "words-100",
    targetWords: 100,
    titleKey: "m100.title",
    descKey: "m100.desc",
  };

  it("does not render when isOpen is false", () => {
    const handleClose = vi.fn();
    render(
      <HabitMilestoneModal
        isOpen={false}
        milestone={mockMilestone50}
        onClose={handleClose}
      />,
    );

    expect(screen.queryByTestId("habit-milestone-modal")).toBeNull();
  });

  it("renders 50-word milestone details and triggers onClose when CTA is clicked", () => {
    const handleClose = vi.fn();
    render(
      <HabitMilestoneModal
        isOpen={true}
        milestone={mockMilestone50}
        onClose={handleClose}
      />,
    );

    expect(screen.getByTestId("habit-milestone-modal")).toBeDefined();
    expect(
      screen.getByRole("heading", { name: /50 từ/i }),
    ).toBeDefined();

    const ctaButton = screen.getByTestId("habit-milestone-cta");
    expect(ctaButton).toBeDefined();

    fireEvent.click(ctaButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders 100-word milestone details and closes on Escape key", () => {
    const handleClose = vi.fn();
    render(
      <HabitMilestoneModal
        isOpen={true}
        milestone={mockMilestone100}
        onClose={handleClose}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /100 từ/i }),
    ).toBeDefined();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
