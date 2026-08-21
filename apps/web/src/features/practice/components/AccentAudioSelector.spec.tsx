import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AccentAudioSelector } from "./AccentAudioSelector";

describe("AccentAudioSelector component", () => {
  it("renders US and UK tabs and allows switching accents", () => {
    const onSelectAccent = vi.fn();
    const onToggleSpeed = vi.fn();
    const onPlayAudio = vi.fn();

    render(
      <AccentAudioSelector
        activeAccent="en-US"
        playbackSpeed={1.0}
        onSelectAccent={onSelectAccent}
        onToggleSpeed={onToggleSpeed}
        onPlayAudio={onPlayAudio}
      />,
    );

    const ukTab = screen.getByTestId("accent-tab-uk");
    fireEvent.click(ukTab);
    expect(onSelectAccent).toHaveBeenCalledWith("en-GB");
  });

  it("handles speed toggle click", () => {
    const onSelectAccent = vi.fn();
    const onToggleSpeed = vi.fn();
    const onPlayAudio = vi.fn();

    render(
      <AccentAudioSelector
        activeAccent="en-US"
        playbackSpeed={1.0}
        onSelectAccent={onSelectAccent}
        onToggleSpeed={onToggleSpeed}
        onPlayAudio={onPlayAudio}
      />,
    );

    const speedBtn = screen.getByTestId("speed-toggle-button");
    fireEvent.click(speedBtn);
    expect(onToggleSpeed).toHaveBeenCalled();
  });

  it("handles play audio click", () => {
    const onSelectAccent = vi.fn();
    const onToggleSpeed = vi.fn();
    const onPlayAudio = vi.fn();

    render(
      <AccentAudioSelector
        activeAccent="en-US"
        playbackSpeed={1.0}
        onSelectAccent={onSelectAccent}
        onToggleSpeed={onToggleSpeed}
        onPlayAudio={onPlayAudio}
      />,
    );

    const playBtn = screen.getByTestId("play-audio-button");
    fireEvent.click(playBtn);
    expect(onPlayAudio).toHaveBeenCalled();
  });
});
