import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ListeningTypingInput } from "./ListeningTypingInput";
import type { DiffSpan } from "@wordstreak/shared-types";

describe("ListeningTypingInput Component", () => {
  const defaultProps = {
    value: "",
    wordLength: 9,
    feedbackState: "IDLE" as const,
    characterDiff: null,
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    disabled: false,
    autoFocus: true,
  };

  it("TC-LISTEN-012: renders character slot dashes and input field with autofocus", () => {
    render(<ListeningTypingInput {...defaultProps} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();

    // Verify slot dashes container exists
    expect(screen.getByTestId("character-slots")).toBeInTheDocument();
  });

  it("calls onChange when typing into the input field", () => {
    const onChange = vi.fn();
    render(<ListeningTypingInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "efficient" } });

    expect(onChange).toHaveBeenCalledWith("efficient");
  });

  it("calls onSubmit when Enter is pressed", () => {
    const onSubmit = vi.fn();
    render(
      <ListeningTypingInput
        {...defaultProps}
        value="efficient"
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(onSubmit).toHaveBeenCalled();
  });

  it("renders CORRECT emerald feedback state with success indicator", () => {
    render(
      <ListeningTypingInput
        {...defaultProps}
        value="efficient"
        feedbackState="CORRECT"
      />,
    );

    const container = screen.getByTestId("typing-input-container");
    expect(container).toHaveClass("border-[#27c93f]");
    expect(screen.getByTestId("feedback-correct-icon")).toBeInTheDocument();
  });

  it("renders INCORRECT error feedback state and character diff visualizer", () => {
    const mockDiff: DiffSpan[] = [
      { char: "a", type: "MATCH" },
      { char: "c", type: "MATCH" },
      { char: "c", type: "MISSING" },
      { char: "o", type: "MATCH" },
      { char: "m", type: "MATCH" },
      { char: "m", type: "MISSING" },
      { char: "o", type: "MATCH" },
      { char: "d", type: "MATCH" },
      { char: "a", type: "MATCH" },
      { char: "t", type: "MATCH" },
      { char: "i", type: "MATCH" },
      { char: "o", type: "MATCH" },
      { char: "n", type: "MATCH" },
    ];

    render(
      <ListeningTypingInput
        {...defaultProps}
        value="acomodation"
        feedbackState="INCORRECT"
        characterDiff={mockDiff}
      />,
    );

    const container = screen.getByTestId("typing-input-container");
    expect(container).toHaveClass("border-[#ff5f56]");
    expect(screen.getByTestId("feedback-incorrect-icon")).toBeInTheDocument();

    // Verify character diff visualizer renders missing badges
    const diffContainer = screen.getByTestId("character-diff-view");
    expect(diffContainer).toBeInTheDocument();
    expect(screen.getAllByText("c").length).toBeGreaterThanOrEqual(1);
  });
});
