import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LevelUpCelebrationModal } from "./LevelUpCelebrationModal";
import { MasteryTier } from "@wordstreak/shared-types";

// Mock canvas-confetti
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

describe("LevelUpCelebrationModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <LevelUpCelebrationModal isOpen={false} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal with level, tier crest and copy when open", () => {
    const onClose = vi.fn();
    render(
      <LevelUpCelebrationModal
        isOpen={true}
        onClose={onClose}
        currentLevel={6}
        currentTier={MasteryTier.SILVER}
        isTierPromotion={true}
        previousTier={MasteryTier.BRONZE}
      />,
    );

    const modal = screen.getByTestId("level-up-modal");
    expect(modal).toBeDefined();
    expect(screen.getByText("Cấp Độ 6! 🎉")).toBeDefined();
    expect(screen.getByText("Lv. 6")).toBeDefined();
    expect(screen.getByText("Hạng Bạc")).toBeDefined();

    // Verify tier promotion banner
    const promoBadge = screen.getByTestId("tier-promotion-badge");
    expect(promoBadge).toBeDefined();
    expect(promoBadge.textContent).toContain("THĂNG HẠNG");
  });

  it("calls onClose when action button is clicked", () => {
    const onClose = vi.fn();
    render(
      <LevelUpCelebrationModal
        isOpen={true}
        onClose={onClose}
        currentLevel={10}
        currentTier={MasteryTier.SILVER}
      />,
    );

    const continueBtn = screen.getByText("Tiếp tục học");
    fireEvent.click(continueBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <LevelUpCelebrationModal
        isOpen={true}
        onClose={onClose}
        currentLevel={10}
        currentTier={MasteryTier.SILVER}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
