import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { KnownWordTriageModal } from "../components/KnownWordTriageModal";
import { libraryService } from "../services/libraryService";
import type { OfficialDeckCardItemDto } from "@wordstreak/shared-types";

vi.mock("../services/libraryService", () => ({
  libraryService: {
    triageDeck: vi.fn(),
  },
}));

const mockCards: OfficialDeckCardItemDto[] = [
  {
    cardId: "c1",
    order: 1,
    headword: "agenda",
    pos: "n",
    content: {
      meaning_vi: "chương trình nghị sự",
      ipa_us: "/əˈdʒen.də/",
      example_en: "The team discussed the first item on the agenda.",
      example_vi: "Nhóm đã thảo luận mục đầu tiên trong chương trình nghị sự.",
    },
  },
  {
    cardId: "c2",
    order: 2,
    headword: "collaborate",
    pos: "v",
    content: {
      meaning_vi: "hợp tác, phối hợp",
      ipa_us: "/kəˈlæb.ə.reɪt/",
      example_en: "We will collaborate on this initiative.",
      example_vi: "Chúng tôi sẽ hợp tác trong sáng kiến này.",
    },
  },
];

describe("KnownWordTriageModal (TC-LIB-05)", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    deckId: "deck-123",
    deckTitle: "Office Operations",
    cards: mockCards,
    onTriageComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(<KnownWordTriageModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Lọc từ đã biết trước khi học")).not.toBeInTheDocument();
  });

  it("renders the first card with word, POS, and example sentence", () => {
    render(<KnownWordTriageModal {...defaultProps} />);

    expect(screen.getByText("Lọc từ đã biết trước khi học")).toBeInTheDocument();
    expect(screen.getByText("agenda")).toBeInTheDocument();
    expect(screen.getByText("n")).toBeInTheDocument();
    expect(screen.getByText("/əˈdʒen.də/")).toBeInTheDocument();
    expect(screen.getByText("The team discussed the first item on the agenda.")).toBeInTheDocument();
    expect(screen.getByText("Thẻ 1 / 2")).toBeInTheDocument();
  });

  it("marks word as unknown when clicking 'Chưa biết' button and advances", () => {
    render(<KnownWordTriageModal {...defaultProps} />);

    const unknownBtn = screen.getByRole("button", { name: /Chưa biết/i });
    fireEvent.click(unknownBtn);

    // Second card should now be displayed
    expect(screen.getByText("collaborate")).toBeInTheDocument();
    expect(screen.getByText("Thẻ 2 / 2")).toBeInTheDocument();
    expect(screen.getByText("Cần học: 1")).toBeInTheDocument();
  });

  it("marks word as known when clicking 'Đã biết' in standard mode", () => {
    render(<KnownWordTriageModal {...defaultProps} isBeginnerMode={false} />);

    const knownBtn = screen.getByRole("button", { name: /Đã biết/i });
    fireEvent.click(knownBtn);

    // Second card should now be displayed
    expect(screen.getByText("collaborate")).toBeInTheDocument();
    expect(screen.getByText("Đã biết: 1")).toBeInTheDocument();
  });

  it("supports keyboard navigation: ArrowRight / K for known, ArrowLeft / U for unknown", () => {
    render(<KnownWordTriageModal {...defaultProps} />);

    // Press ArrowRight to mark first card as known
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("collaborate")).toBeInTheDocument();
    expect(screen.getByText("Đã biết: 1")).toBeInTheDocument();

    // Press 'u' to mark second card as unknown
    fireEvent.keyDown(window, { key: "u" });

    // Should reach the finished summary screen
    expect(screen.getByText("Đã phân loại xong 25 từ!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Lưu & Bắt đầu học/i })).toBeInTheDocument();
  });

  it("supports Undo functionality (Z key or button) to revisit previous card", () => {
    render(<KnownWordTriageModal {...defaultProps} />);

    const unknownBtn = screen.getByRole("button", { name: /Chưa biết/i });
    fireEvent.click(unknownBtn);

    expect(screen.getByText("collaborate")).toBeInTheDocument();
    expect(screen.getByText("Cần học: 1")).toBeInTheDocument();

    // Click Undo
    const undoBtn = screen.getByRole("button", { name: /Hoàn tác/i });
    fireEvent.click(undoBtn);

    // Back to first card
    expect(screen.getByText("agenda")).toBeInTheDocument();
    expect(screen.getByText("Cần học: 0")).toBeInTheDocument();
  });

  it("submits triage decisions and completes triage", async () => {
    vi.mocked(libraryService.triageDeck).mockResolvedValue({
      success: true,
      deckId: "deck-123",
      knownCount: 1,
      unknownCount: 1,
      totalTriaged: 2,
    });

    render(<KnownWordTriageModal {...defaultProps} />);

    // Card 1 -> Known
    fireEvent.keyDown(window, { key: "k" });
    // Card 2 -> Unknown
    fireEvent.keyDown(window, { key: "u" });

    // Finished summary screen
    const saveBtn = screen.getByRole("button", { name: /Lưu & Bắt đầu học/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(libraryService.triageDeck).toHaveBeenCalledWith("deck-123", [
        { cardId: "c1", isKnown: true },
        { cardId: "c2", isKnown: false },
      ]);
      expect(defaultProps.onTriageComplete).toHaveBeenCalledWith({
        knownCount: 1,
        unknownCount: 1,
      });
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it("shows quick popover quiz when beginner mode user clicks 'Đã biết'", async () => {
    render(<KnownWordTriageModal {...defaultProps} isBeginnerMode={true} />);

    const knownBtn = screen.getByRole("button", { name: /Đã biết/i });
    fireEvent.click(knownBtn);

    // Popover quiz appears
    expect(screen.getByText("Xác nhận nhanh: Từ này có nghĩa là gì?")).toBeInTheDocument();
    const correctOption = screen.getByText("chương trình nghị sự");
    expect(correctOption).toBeInTheDocument();

    // Click correct answer
    fireEvent.click(correctOption);

    // Should advance after brief delay
    await waitFor(
      () => {
        expect(screen.getByText("collaborate")).toBeInTheDocument();
      },
      { timeout: 1500 },
    );
  });
});
