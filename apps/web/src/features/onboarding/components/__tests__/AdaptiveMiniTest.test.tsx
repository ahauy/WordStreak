import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AdaptiveMiniTest } from "../AdaptiveMiniTest";

describe("AdaptiveMiniTest Component (US-LIB-11)", () => {
  const mockOnComplete = vi.fn();
  const mockOnSkip = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render question 1 and allow selecting correct option", () => {
    render(
      <AdaptiveMiniTest
        isVi={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />,
    );

    expect(screen.getByText("time")).toBeDefined();
    expect(screen.getByText("1 / 5")).toBeDefined();

    // Select the correct answer "thời gian"
    const correctBtn = screen.getByRole("button", { name: /thời gian/i });
    fireEvent.click(correctBtn);

    // Fast-forward delay
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // Should advance to question 2 ("water")
    expect(screen.getByText("water")).toBeDefined();
    expect(screen.getByText("2 / 5")).toBeDefined();
  });

  it("should trigger Early Stop when learner makes 3 consecutive mistakes", () => {
    render(
      <AdaptiveMiniTest
        isVi={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />,
    );

    // Q1: "time" -> wrong answer "tiền bạc"
    fireEvent.click(screen.getByRole("button", { name: /tiền bạc/i }));
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // Q2: "water" -> wrong answer "ngọn lửa"
    fireEvent.click(screen.getByRole("button", { name: /ngọn lửa/i }));
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // Q3: "house" -> wrong answer "chiếc xe"
    fireEvent.click(screen.getByRole("button", { name: /chiếc xe/i }));
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // Should now show Early Stop result screen recommending ZERO (Foundation)
    expect(screen.getByTestId("mini-test-result")).toBeDefined();
    expect(
      screen.getByText(/Bài test tự động dừng sớm để không làm bạn mất thời gian/i),
    ).toBeDefined();
    expect(
      screen.getByText(/Đề xuất: Chặng Khởi động \(Foundation\)/i),
    ).toBeDefined();

    // Clicking "Apply & Continue" calls onComplete with "ZERO"
    const applyBtn = screen.getByRole("button", { name: /Áp dụng & Tiếp tục/i });
    fireEvent.click(applyBtn);
    expect(mockOnComplete).toHaveBeenCalledWith("ZERO");
  });

  it("should recommend BEGINNER when learner scores >= 3 correct answers", () => {
    render(
      <AdaptiveMiniTest
        isVi={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />,
    );

    // Q1: "time" -> correct "thời gian"
    fireEvent.click(screen.getByRole("button", { name: /thời gian/i }));
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // Q2: "water" -> correct "nước uống"
    fireEvent.click(screen.getByRole("button", { name: /nước uống/i }));
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // Q3: "house" -> correct "ngôi nhà"
    fireEvent.click(screen.getByRole("button", { name: /ngôi nhà/i }));
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // Q4: "friend" -> wrong "kẻ thù"
    fireEvent.click(screen.getByRole("button", { name: /kẻ thù/i }));
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // Q5: "learn" -> correct "học tập"
    fireEvent.click(screen.getByRole("button", { name: /học tập/i }));
    act(() => {
      vi.advanceTimersByTime(450);
    });

    // Result screen
    expect(screen.getByTestId("mini-test-result")).toBeDefined();
    expect(
      screen.getByText(/Đề xuất: Sơ cấp \(Beginner\)/i),
    ).toBeDefined();
    expect(
      screen.getByText(/Bạn đã trả lời đúng 4\/5 từ nền tảng/i),
    ).toBeDefined();

    const applyBtn = screen.getByRole("button", { name: /Áp dụng & Tiếp tục/i });
    fireEvent.click(applyBtn);
    expect(mockOnComplete).toHaveBeenCalledWith("BEGINNER");
  });

  it("should allow skipping test via skip button", () => {
    render(
      <AdaptiveMiniTest
        isVi={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />,
    );

    const skipBtn = screen.getByRole("button", { name: /Bỏ qua test/i });
    fireEvent.click(skipBtn);
    expect(mockOnSkip).toHaveBeenCalled();
  });
});
