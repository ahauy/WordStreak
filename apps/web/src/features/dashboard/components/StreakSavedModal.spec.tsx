import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StreakSavedModal } from "./StreakSavedModal";

describe("StreakSavedModal Component (TC-FREEZE-007)", () => {
  it("should render alert modal when isOpen is true with Streak Protected title", () => {
    render(
      <StreakSavedModal
        isOpen={true}
        onClose={vi.fn()}
        streakDays={5}
        streakFreezes={1}
        maxStreakFreezes={2}
      />,
    );

    expect(screen.getByText("Streak Protected!")).toBeDefined();
    expect(screen.getByText("Streak Freeze Activated")).toBeDefined();
    expect(screen.getByText(/automatically protected your/i)).toBeDefined();
    expect(screen.getByText("5-day")).toBeDefined();
    expect(screen.getByText(/1 freeze remaining/i)).toBeDefined();
  });

  it("should format plural freezes remaining correctly", () => {
    render(
      <StreakSavedModal
        isOpen={true}
        onClose={vi.fn()}
        streakDays={10}
        streakFreezes={2}
        maxStreakFreezes={2}
      />,
    );

    expect(screen.getByText(/2 freezes remaining/i)).toBeDefined();
    expect(screen.getByText("2/2")).toBeDefined();
  });

  it("should call onClose when Keep Learning button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <StreakSavedModal
        isOpen={true}
        onClose={handleClose}
        streakDays={5}
        streakFreezes={1}
      />,
    );

    const actionButton = screen.getByRole("button", {
      name: /Keep Learning/i,
    });
    fireEvent.click(actionButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when close X button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <StreakSavedModal
        isOpen={true}
        onClose={handleClose}
        streakDays={5}
        streakFreezes={1}
      />,
    );

    const closeButton = screen.getByLabelText("Close streak saved modal");
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(
      <StreakSavedModal
        isOpen={true}
        onClose={handleClose}
        streakDays={5}
        streakFreezes={1}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should not render modal content when isOpen is false", () => {
    const { container } = render(
      <StreakSavedModal
        isOpen={false}
        onClose={vi.fn()}
        streakDays={5}
        streakFreezes={1}
      />,
    );

    expect(screen.queryByText("Streak Protected!")).toBeNull();
    expect(container.innerHTML).toBe("");
  });
});
