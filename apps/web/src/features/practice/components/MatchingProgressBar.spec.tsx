import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MatchingProgressBar } from "./MatchingProgressBar";

describe("MatchingProgressBar", () => {
  it("renders round indicator, deck title, and timer", () => {
    render(
      <MatchingProgressBar
        currentRoundIndex={0}
        totalRounds={2}
        roundMatchedCount={2}
        roundTotalCount={5}
        timerSeconds={45}
        isZenMode={false}
        currentCombo={0}
        isMuted={false}
        onToggleMute={vi.fn()}
        onExit={vi.fn()}
        deckTitle="TOEIC Essential Vocabulary"
      />,
    );

    expect(screen.getByText(/Vòng 1\/2/i)).toBeInTheDocument();
    expect(screen.getByText("TOEIC Essential Vocabulary")).toBeInTheDocument();
    expect(screen.getByText("00:45")).toBeInTheDocument();
  });

  it("renders combo flame badge when combo >= 2", () => {
    render(
      <MatchingProgressBar
        currentRoundIndex={0}
        totalRounds={2}
        roundMatchedCount={3}
        roundTotalCount={5}
        timerSeconds={30}
        isZenMode={false}
        currentCombo={4}
        isMuted={false}
        onToggleMute={vi.fn()}
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByText(/4x Combo/i)).toBeInTheDocument();
  });

  it("triggers onToggleMute on mute button click", () => {
    const handleToggleMute = vi.fn();
    render(
      <MatchingProgressBar
        currentRoundIndex={0}
        totalRounds={2}
        roundMatchedCount={0}
        roundTotalCount={5}
        timerSeconds={30}
        isZenMode={false}
        currentCombo={0}
        isMuted={false}
        onToggleMute={handleToggleMute}
        onExit={vi.fn()}
      />,
    );

    const muteBtn = screen.getByRole("button", { name: /âm thanh/i });
    fireEvent.click(muteBtn);
    expect(handleToggleMute).toHaveBeenCalled();
  });

  it("triggers onExit on exit button click", () => {
    const handleExit = vi.fn();
    render(
      <MatchingProgressBar
        currentRoundIndex={0}
        totalRounds={2}
        roundMatchedCount={0}
        roundTotalCount={5}
        timerSeconds={30}
        isZenMode={false}
        currentCombo={0}
        isMuted={false}
        onToggleMute={vi.fn()}
        onExit={handleExit}
      />,
    );

    const exitBtn = screen.getByRole("button", { name: /thoát/i });
    fireEvent.click(exitBtn);
    expect(handleExit).toHaveBeenCalled();
  });

  it("renders Zen mode stopwatch format", () => {
    render(
      <MatchingProgressBar
        currentRoundIndex={0}
        totalRounds={2}
        roundMatchedCount={0}
        roundTotalCount={5}
        timerSeconds={85}
        isZenMode={true}
        currentCombo={0}
        isMuted={false}
        onToggleMute={vi.fn()}
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByText("01:25")).toBeInTheDocument();
    expect(screen.getByText(/Zen/i)).toBeInTheDocument();
  });
});
