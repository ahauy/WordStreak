import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AcousticSoundwave } from "./AcousticSoundwave";

describe("AcousticSoundwave component", () => {
  it("renders the correct number of soundwave bars", () => {
    render(<AcousticSoundwave bars={[0.2, 0.4, 0.6, 0.8, 1.0]} barCount={5} />);
    const bars = screen.getAllByTestId("soundwave-bar");
    expect(bars).toHaveLength(5);
  });

  it("applies active purple styling when isListening is true", () => {
    render(
      <AcousticSoundwave
        isListening={true}
        bars={[0.8, 0.8, 0.8]}
        barCount={3}
      />,
    );
    const bars = screen.getAllByTestId("soundwave-bar");
    expect(bars[0].className).toContain("bg-purple-600");
  });

  it("applies neutral styling when isListening is false", () => {
    render(
      <AcousticSoundwave
        isListening={false}
        bars={[0.8, 0.8, 0.8]}
        barCount={3}
      />,
    );
    const bars = screen.getAllByTestId("soundwave-bar");
    expect(bars[0].className).toContain("bg-neutral-300");
  });
});
