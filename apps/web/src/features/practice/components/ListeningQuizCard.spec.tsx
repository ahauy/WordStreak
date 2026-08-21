import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ListeningQuizCard } from "./ListeningQuizCard";
import type { ListeningQuestionDto } from "@wordstreak/shared-types";

describe("ListeningQuizCard Component", () => {
  const mockQuestion: ListeningQuestionDto = {
    id: "lq_1",
    cardId: "card_1",
    word: "efficient",
    meaning: "hiệu quả",
    phonetic: "/ɪˈfɪʃ.ənt/",
    audioUrl: "https://cdn.wordstreak.com/audio/efficient.mp3",
    wordLength: 9,
    firstLetterHint: "e",
  };

  const defaultProps = {
    question: mockQuestion,
    typedInput: "",
    feedbackState: "IDLE" as const,
    hintLevel: 0,
    replayCount: 0,
    playbackSpeed: 1.0,
    isPlayingAudio: false,
    needsUserGesture: false,
    characterDiff: null,
    onInputChange: vi.fn(),
    onSubmit: vi.fn(),
    onReplayAudio: vi.fn(),
    onToggleSpeed: vi.fn(),
    onTriggerHint: vi.fn(),
    onUnlockAudio: vi.fn(),
  };

  it("TC-LISTEN-013: renders speaker pulse, speed toggle pill, replay button and typing input", () => {
    render(<ListeningQuizCard {...defaultProps} isPlayingAudio={true} />);

    expect(screen.getByTestId("audio-waveform-speaker")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /1\.0x/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /nghe lại/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("calls onReplayAudio when replay button is clicked", () => {
    const onReplayAudio = vi.fn();
    render(
      <ListeningQuizCard {...defaultProps} onReplayAudio={onReplayAudio} />,
    );

    const replayBtn = screen.getByRole("button", { name: /nghe lại/i });
    fireEvent.click(replayBtn);

    expect(onReplayAudio).toHaveBeenCalledTimes(1);
  });

  it("calls onToggleSpeed when speed toggle pill is clicked", () => {
    const onToggleSpeed = vi.fn();
    render(
      <ListeningQuizCard {...defaultProps} onToggleSpeed={onToggleSpeed} />,
    );

    const speedBtn = screen.getByRole("button", { name: /1\.0x/i });
    fireEvent.click(speedBtn);

    expect(onToggleSpeed).toHaveBeenCalledTimes(1);
  });

  it("displays autoplay gesture unlock button when needsUserGesture is true", () => {
    const onUnlockAudio = vi.fn();
    render(
      <ListeningQuizCard
        {...defaultProps}
        needsUserGesture={true}
        onUnlockAudio={onUnlockAudio}
      />,
    );

    const unlockBtn = screen.getByRole("button", {
      name: /click to listen/i,
    });
    expect(unlockBtn).toBeInTheDocument();

    fireEvent.click(unlockBtn);
    expect(onUnlockAudio).toHaveBeenCalledTimes(1);
  });
});
