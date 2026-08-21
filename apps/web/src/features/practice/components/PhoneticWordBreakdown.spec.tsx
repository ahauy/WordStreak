import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhoneticWordBreakdown } from "./PhoneticWordBreakdown";
import type { DiffSpan } from "@wordstreak/shared-types";

describe("PhoneticWordBreakdown component", () => {
  it("renders syllable chips and identifies primary stress", () => {
    const onPlaySyllable = vi.fn();
    render(
      <PhoneticWordBreakdown
        phonetic="/ˈel.ɪ.kwənt/"
        onPlaySyllable={onPlaySyllable}
      />,
    );

    expect(screen.getByText("el")).toBeDefined();
    expect(screen.getByText("ɪ")).toBeDefined();
    expect(screen.getByText("kwənt")).toBeDefined();

    const firstChip = screen.getByTestId("syllable-chip-0");
    fireEvent.click(firstChip);
    expect(onPlaySyllable).toHaveBeenCalledWith("el");
  });

  it("renders character diff spans accurately", () => {
    const diffSpans: DiffSpan[] = [
      { char: "e", type: "MATCH" },
      { char: "l", type: "MATCH" },
      { char: "a", type: "MISSING" },
      { char: "x", type: "EXTRA" },
      { char: "o", type: "WRONG" },
    ];

    render(
      <PhoneticWordBreakdown phonetic="/ˈel.ɪ.kwənt/" diffSpans={diffSpans} />,
    );

    expect(screen.getByTestId("diff-breakdown")).toBeDefined();
    expect(screen.getAllByTestId("diff-match")).toHaveLength(2);
    expect(screen.getByTestId("diff-missing")).toBeDefined();
    expect(screen.getByTestId("diff-extra")).toBeDefined();
    expect(screen.getByTestId("diff-wrong")).toBeDefined();
  });
});
