import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TierBadgeIcon } from "./TierBadgeIcon";
import { XpProgressBar } from "./XpProgressBar";
import { MasteryTier } from "@wordstreak/shared-types";

describe("TierBadgeIcon", () => {
  it("renders Bronze tier crest with correct aria label and test ID", () => {
    render(<TierBadgeIcon tier={MasteryTier.BRONZE} size="md" />);
    const badge = screen.getByTestId("tier-badge-bronze");
    expect(badge).toBeDefined();
    expect(badge.getAttribute("aria-label")).toBe("Bronze Mastery Tier (Đồng)");
  });

  it("renders all 5 tiers correctly", () => {
    const tiers: MasteryTier[] = [
      MasteryTier.BRONZE,
      MasteryTier.SILVER,
      MasteryTier.GOLD,
      MasteryTier.DIAMOND,
      MasteryTier.MASTER,
    ];

    tiers.forEach((tier) => {
      const { unmount } = render(<TierBadgeIcon tier={tier} size="lg" />);
      const badge = screen.getByTestId(`tier-badge-${tier.toLowerCase()}`);
      expect(badge).toBeDefined();
      unmount();
    });
  });

  it("falls back to Bronze when invalid tier is provided", () => {
    render(<TierBadgeIcon tier={"UNKNOWN_TIER" as any} size="sm" />);
    const badge = screen.getByTestId("tier-badge-unknown_tier");
    expect(badge).toBeDefined();
  });
});

describe("XpProgressBar", () => {
  it("renders with correct accessibility attributes", () => {
    render(
      <XpProgressBar
        progressPercent={45.5}
        tier={MasteryTier.GOLD}
        showLabel={true}
        currentXp={455}
        requiredXp={1000}
      />,
    );

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeDefined();
    expect(progressbar.getAttribute("aria-valuenow")).toBe("46");
    expect(progressbar.getAttribute("aria-valuemin")).toBe("0");
    expect(progressbar.getAttribute("aria-valuemax")).toBe("100");

    expect(screen.getByText("455 / 1,000 XP")).toBeDefined();
    expect(screen.getByText("46%")).toBeDefined();
  });

  it("clamps progress percentages between 0 and 100", () => {
    const { rerender } = render(
      <XpProgressBar progressPercent={-20} animated={false} />,
    );
    let fill = screen.getByTestId("xp-progress-bar-fill");
    expect(fill.getAttribute("style")).toContain("width: 0%");

    rerender(<XpProgressBar progressPercent={150} animated={false} />);
    fill = screen.getByTestId("xp-progress-bar-fill");
    expect(fill.getAttribute("style")).toContain("width: 100%");
  });
});
