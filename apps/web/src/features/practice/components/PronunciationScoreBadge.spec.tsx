import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PronunciationScoreBadge } from "./PronunciationScoreBadge";
import { VoicePronunciationTier } from "@wordstreak/shared-types";

describe("PronunciationScoreBadge component", () => {
  it("renders EXACT tier with emerald styling and score", () => {
    render(
      <PronunciationScoreBadge
        score={100}
        tier={VoicePronunciationTier.EXACT}
        xpAwarded={10}
      />,
    );
    expect(screen.getByText("100%")).toBeDefined();
    expect(screen.getByText("Exact Match")).toBeDefined();
    expect(screen.getByText("+10 XP")).toBeDefined();
  });

  it("renders CLOSE tier with purple styling", () => {
    render(
      <PronunciationScoreBadge
        score={88}
        tier={VoicePronunciationTier.CLOSE}
        xpAwarded={10}
      />,
    );
    expect(screen.getByText("88%")).toBeDefined();
    expect(screen.getByText("Close Match")).toBeDefined();
  });

  it("renders RETRY tier with amber styling and 0 XP", () => {
    render(
      <PronunciationScoreBadge
        score={65}
        tier={VoicePronunciationTier.RETRY}
        xpAwarded={0}
      />,
    );
    expect(screen.getByText("65%")).toBeDefined();
    expect(screen.getByText("Needs Practice")).toBeDefined();
    expect(screen.queryByText("+10 XP")).toBeNull();
  });

  it("shows daily XP capped note when capped", () => {
    render(
      <PronunciationScoreBadge
        score={95}
        tier={VoicePronunciationTier.CLOSE}
        xpAwarded={0}
        isDailyCapped={true}
      />,
    );
    expect(screen.getByText("(Daily XP Capped)")).toBeDefined();
  });
});
