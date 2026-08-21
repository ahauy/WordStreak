import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProgressiveHintBox } from "./ProgressiveHintBox";

describe("ProgressiveHintBox Component", () => {
  const defaultProps = {
    hintLevel: 0,
    word: "perseverance",
    meaning: "sự kiên trì, bền bỉ",
    phonetic: "/ˌpɜː.sɪˈvɪə.rəns/",
    wordLength: 12,
    onTriggerHint: vi.fn(),
    disabled: false,
  };

  it("renders trigger button and speed bonus notice when hintLevel is 0", () => {
    render(<ProgressiveHintBox {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /gợi ý|hint/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/sự kiên trì/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/\/ˌpɜː\.sɪˈvɪə\.rəns\//),
    ).not.toBeInTheDocument();
  });

  it("calls onTriggerHint when hint button is clicked", () => {
    const onTriggerHint = vi.fn();
    render(
      <ProgressiveHintBox {...defaultProps} onTriggerHint={onTriggerHint} />,
    );

    const button = screen.getByRole("button", { name: /gợi ý|hint/i });
    fireEvent.click(button);

    expect(onTriggerHint).toHaveBeenCalledTimes(1);
  });

  it("renders Tier 1 hint: word length and first letter slots", () => {
    render(<ProgressiveHintBox {...defaultProps} hintLevel={1} />);

    expect(screen.getByText(/12 chữ cái/i)).toBeInTheDocument();
    expect(screen.getByText(/P _ _ _ _ _ _ _ _ _ _ _/i)).toBeInTheDocument();
    expect(screen.queryByText(/sự kiên trì/i)).not.toBeInTheDocument();
  });

  it("renders Tier 2 hint: Vietnamese meaning", () => {
    render(<ProgressiveHintBox {...defaultProps} hintLevel={2} />);

    expect(screen.getByText(/sự kiên trì, bền bỉ/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/\/ˌpɜː\.sɪˈvɪə\.rəns\//),
    ).not.toBeInTheDocument();
  });

  it("renders Tier 3 hint: Phonetic IPA and disables further hints", () => {
    render(<ProgressiveHintBox {...defaultProps} hintLevel={3} />);

    expect(screen.getByText(/sự kiên trì, bền bỉ/i)).toBeInTheDocument();
    expect(screen.getByText(/\/ˌpɜː\.sɪˈvɪə\.rəns\//)).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /gợi ý|hint/i });
    expect(button).toBeDisabled();
  });
});
