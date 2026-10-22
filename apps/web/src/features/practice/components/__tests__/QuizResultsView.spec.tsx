import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QuizResultsView } from "../QuizResultsView";
import type { QuizResultResponseDto } from "@wordstreak/shared-types";

describe("QuizResultsView (US-UX-02)", () => {
  const mockResult: QuizResultResponseDto = {
    totalQuestions: 5,
    correctCount: 4,
    accuracyPercentage: 80,
    totalXpEarned: 45,
    maxCombo: 4,
    missedCards: [],
    autoGradedReviews: [
      {
        cardId: "c1",
        rating: 4,
        interval: 1,
        repetitions: 1,
        status: "LEARNING",
      },
      {
        cardId: "c2",
        rating: 3,
        interval: 1,
        repetitions: 1,
        status: "LEARNING",
      },
    ],
  };

  it("renders quiz score, accuracy and XP earned", () => {
    render(
      <QuizResultsView
        result={mockResult}
        onRetake={vi.fn()}
        onBackToDeck={vi.fn()}
      />,
    );

    expect(screen.getByText(/4 out of 5 questions/i)).toBeInTheDocument();
    expect(screen.getByText(/80/)).toBeInTheDocument();
    expect(screen.getByText(/45/)).toBeInTheDocument();
  });

  it("displays auto-graded SRS notice when autoGradedReviews is present", () => {
    render(
      <QuizResultsView
        result={mockResult}
        onRetake={vi.fn()}
        onBackToDeck={vi.fn()}
      />,
    );

    const notice = screen.getByTestId("auto-graded-srs-notice");
    expect(notice).toBeInTheDocument();
    expect(
      screen.getByText(/2 từ đã được cập nhật lịch ôn tập ngắt quãng/i),
    ).toBeInTheDocument();
  });
});
