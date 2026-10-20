import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { FoundationPathView } from "../components/FoundationPathView";
import { MiniLessonModal } from "../components/MiniLessonModal";
import { FOUNDATION_DECKS } from "../data/foundationDecks";
import { FOUNDATION_MINI_LESSONS } from "../data/foundationLessons";

describe("Foundation Stage & Mini-lessons (US-LIB-12)", () => {
  it("should verify dataset integrity: 15 decks with 20 words each and 4 mini-lessons", () => {
    expect(FOUNDATION_DECKS).toHaveLength(15);
    const totalWords = FOUNDATION_DECKS.reduce((acc, d) => acc + d.wordCount, 0);
    expect(totalWords).toBe(300);

    expect(FOUNDATION_MINI_LESSONS).toHaveLength(4);
    FOUNDATION_MINI_LESSONS.forEach((lesson) => {
      expect(lesson.estimatedMinutes).toBeLessThanOrEqual(2);
      expect(lesson.content.keyPoints.length).toBeGreaterThanOrEqual(2);
      expect(lesson.content.tip).toBeDefined();
    });
  });

  it("should render FoundationPathView with all 15 stages and mini-lesson triggers", () => {
    const mockSelectDeck = vi.fn();
    render(<FoundationPathView onSelectDeck={mockSelectDeck} />);

    expect(screen.getByTestId("foundation-path-view")).toBeDefined();
    expect(screen.getByText(/Chặng Khởi động cho Người Mất gốc/i)).toBeDefined();

    // Verify all 15 stage steps are present
    for (let i = 1; i <= 15; i++) {
      expect(screen.getByTestId(`stage-step-${i}`)).toBeDefined();
    }

    // Verify at least one mini-lesson preview is visible
    expect(screen.getByText(/4 Từ loại cốt lõi/i)).toBeDefined();
  });

  it("should open MiniLessonModal when clicking 'Xem bài học' and close cleanly", () => {
    render(<FoundationPathView />);

    // Click the first "Xem bài học" button
    const lessonButtons = screen.getAllByRole("button", { name: /Xem bài học/i });
    expect(lessonButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(lessonButtons[0]);

    // Modal should be open
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(
      within(dialog).getByText(/Nắm vững Danh từ, Động từ, Tính từ, Trạng từ/i),
    ).toBeDefined();

    // Close the modal
    const closeBtn = within(dialog).getByRole("button", { name: /Đóng bài học/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("should trigger onSelectDeck when clicking 'Tôi đã hiểu, vào học' in MiniLessonModal", () => {
    const mockSelectDeck = vi.fn();
    const lesson = FOUNDATION_MINI_LESSONS[0]; // relatedDeckOrder: 1

    render(
      <MiniLessonModal
        lesson={lesson}
        isOpen={true}
        onClose={vi.fn()}
        onStartDeck={(order) => {
          const deck = FOUNDATION_DECKS.find((d) => d.order === order);
          if (deck) mockSelectDeck(deck);
        }}
      />,
    );

    const startBtn = screen.getByRole("button", {
      name: /Tôi đã hiểu, vào học Chặng 1/i,
    });
    fireEvent.click(startBtn);

    expect(mockSelectDeck).toHaveBeenCalledWith(
      expect.objectContaining({ order: 1 }),
    );
  });
});
