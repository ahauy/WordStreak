import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MatchingTile } from "./MatchingTile";
import type { MatchingCardItemDto } from "@wordstreak/shared-types";

describe("MatchingTile", () => {
  const mockTile: MatchingCardItemDto = {
    id: "w_1",
    cardId: "card_1",
    text: "ubiquitous",
    type: "WORD",
    phonetic: "/juːˈbɪk.wɪ.təs/",
    audioUrl: "https://example.com/audio.mp3",
  };

  it("renders text, phonetic, and hotkey indicator", () => {
    render(
      <MatchingTile
        tile={mockTile}
        state="NEUTRAL"
        hotkeyLabel="1"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("ubiquitous")).toBeInTheDocument();
    expect(screen.getByText("/juːˈbɪk.wɪ.təs/")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("triggers onSelect when clicked in NEUTRAL state", () => {
    const handleSelect = vi.fn();
    render(
      <MatchingTile
        tile={mockTile}
        state="NEUTRAL"
        hotkeyLabel="1"
        onSelect={handleSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /ubiquitous/i }));
    expect(handleSelect).toHaveBeenCalledWith("w_1");
  });

  it("applies selected visual styles when state is SELECTED", () => {
    const { container } = render(
      <MatchingTile
        tile={mockTile}
        state="SELECTED"
        hotkeyLabel="1"
        onSelect={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /ubiquitous/i });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(container.innerHTML).toContain("ring-2");
  });

  it("applies mismatch / error styling when state is MISMATCH", () => {
    const { container } = render(
      <MatchingTile
        tile={mockTile}
        state="MISMATCH"
        hotkeyLabel="1"
        onSelect={vi.fn()}
      />,
    );

    expect(container.innerHTML).toContain("animate-shake");
  });

  it("disables interaction when state is MATCHED", () => {
    const handleSelect = vi.fn();
    render(
      <MatchingTile
        tile={mockTile}
        state="MATCHED"
        hotkeyLabel="1"
        onSelect={handleSelect}
      />,
    );

    const button = screen.getByRole("button", { name: /ubiquitous/i });
    expect(button).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(button);
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("plays pronunciation on speaker button click without triggering tile selection", () => {
    const handleSelect = vi.fn();
    const handlePlayAudio = vi.fn();

    render(
      <MatchingTile
        tile={mockTile}
        state="NEUTRAL"
        hotkeyLabel="1"
        onSelect={handleSelect}
        onPlayAudio={handlePlayAudio}
      />,
    );

    const speakerBtn = screen.getByRole("button", { name: /phát âm/i });
    fireEvent.click(speakerBtn);

    expect(handlePlayAudio).toHaveBeenCalledWith(
      "https://example.com/audio.mp3",
    );
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
