import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MatchingGameBoard } from "./MatchingGameBoard";
import type {
  MatchingCardItemDto,
  MatchingTileState,
} from "@wordstreak/shared-types";

const mockWordTiles: MatchingCardItemDto[] = [
  { id: "w_1", cardId: "c_1", text: "ubiquitous", type: "WORD" },
  { id: "w_2", cardId: "c_2", text: "ephemeral", type: "WORD" },
  { id: "w_3", cardId: "c_3", text: "serendipity", type: "WORD" },
  { id: "w_4", cardId: "c_4", text: "resilient", type: "WORD" },
  { id: "w_5", cardId: "c_5", text: "tenacious", type: "WORD" },
];

const mockMeaningTiles: MatchingCardItemDto[] = [
  { id: "m_2", cardId: "c_2", text: "phù du, ngắn ngủi", type: "MEANING" },
  { id: "m_1", cardId: "c_1", text: "phổ biến khắp nơi", type: "MEANING" },
  { id: "m_3", cardId: "c_3", text: "may mắn bất ngờ", type: "MEANING" },
  { id: "m_5", cardId: "c_5", text: "kiên trì bền bỉ", type: "MEANING" },
  { id: "m_4", cardId: "c_4", text: "kiên cường phục hồi", type: "MEANING" },
];

const mockTileStates: Record<string, MatchingTileState> = {
  w_1: "NEUTRAL",
  w_2: "NEUTRAL",
  w_3: "NEUTRAL",
  w_4: "NEUTRAL",
  w_5: "NEUTRAL",
  m_1: "NEUTRAL",
  m_2: "NEUTRAL",
  m_3: "NEUTRAL",
  m_4: "NEUTRAL",
  m_5: "NEUTRAL",
};

describe("MatchingGameBoard", () => {
  it("renders 2 columns with 5 words and 5 meanings", () => {
    render(
      <MatchingGameBoard
        wordTiles={mockWordTiles}
        meaningTiles={mockMeaningTiles}
        tileStates={mockTileStates}
        selectedTileId={null}
        onSelectTile={vi.fn()}
      />,
    );

    expect(screen.getByText("ubiquitous")).toBeInTheDocument();
    expect(screen.getByText("phổ biến khắp nơi")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Q")).toBeInTheDocument();
  });

  it("handles keyboard shortcut 1-5 for left column", () => {
    const handleSelect = vi.fn();
    render(
      <MatchingGameBoard
        wordTiles={mockWordTiles}
        meaningTiles={mockMeaningTiles}
        tileStates={mockTileStates}
        selectedTileId={null}
        onSelectTile={handleSelect}
      />,
    );

    fireEvent.keyDown(window, { key: "1" });
    expect(handleSelect).toHaveBeenCalledWith("w_1");

    fireEvent.keyDown(window, { key: "3" });
    expect(handleSelect).toHaveBeenCalledWith("w_3");
  });

  it("handles keyboard shortcut Q-T for right column", () => {
    const handleSelect = vi.fn();
    render(
      <MatchingGameBoard
        wordTiles={mockWordTiles}
        meaningTiles={mockMeaningTiles}
        tileStates={mockTileStates}
        selectedTileId={null}
        onSelectTile={handleSelect}
      />,
    );

    fireEvent.keyDown(window, { key: "q" });
    expect(handleSelect).toHaveBeenCalledWith("m_2");

    fireEvent.keyDown(window, { key: "W" });
    expect(handleSelect).toHaveBeenCalledWith("m_1");
  });

  it("triggers onToggleMute on Space key press", () => {
    const handleToggleMute = vi.fn();
    render(
      <MatchingGameBoard
        wordTiles={mockWordTiles}
        meaningTiles={mockMeaningTiles}
        tileStates={mockTileStates}
        selectedTileId={null}
        onSelectTile={vi.fn()}
        onToggleMute={handleToggleMute}
      />,
    );

    fireEvent.keyDown(window, { code: "Space", key: " " });
    expect(handleToggleMute).toHaveBeenCalled();
  });

  it("triggers onExit on Escape key press", () => {
    const handleExit = vi.fn();
    render(
      <MatchingGameBoard
        wordTiles={mockWordTiles}
        meaningTiles={mockMeaningTiles}
        tileStates={mockTileStates}
        selectedTileId={null}
        onSelectTile={vi.fn()}
        onExit={handleExit}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleExit).toHaveBeenCalled();
  });

  it("ignores hotkeys when isLocked is true", () => {
    const handleSelect = vi.fn();
    render(
      <MatchingGameBoard
        wordTiles={mockWordTiles}
        meaningTiles={mockMeaningTiles}
        tileStates={mockTileStates}
        selectedTileId={null}
        onSelectTile={handleSelect}
        isLocked={true}
      />,
    );

    fireEvent.keyDown(window, { key: "1" });
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
