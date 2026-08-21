import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeckImportModal } from "../DeckImportModal";
import type { DeckResponse } from "@wordstreak/shared-types";

// Mock cardsService
vi.mock("../../features/cards/services/cardsService", () => ({
  cardsService: {
    getAllDeckCards: vi.fn().mockResolvedValue([]),
    bulkImport: vi.fn().mockResolvedValue({
      totalSubmitted: 2,
      imported: 2,
      overwritten: 0,
      skipped: 0,
      errors: [],
    }),
  },
}));

describe("DeckImportModal", () => {
  const mockDeck: DeckResponse = {
    id: "deck-123",
    userId: "user-1",
    title: "IELTS Core Vocabulary",
    description: "Sample IELTS Deck",
    isPublic: false,
    color: "violet",
    icon: "book",
    cardCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders upload dropzone and sample download link in Step 1", () => {
    render(
      <DeckImportModal isOpen={true} onClose={vi.fn()} targetDeck={mockDeck} />,
    );

    expect(screen.getByText(/Nhập từ vựng vào bộ từ/i)).toBeDefined();
    expect(screen.getByText(/IELTS Core Vocabulary/i)).toBeDefined();
    expect(screen.getByText(/Kéo thả tập tin vào đây/i)).toBeDefined();
    expect(screen.getByText(/Tải file mẫu CSV chuẩn/i)).toBeDefined();
    expect(screen.getAllByText(/\.CSV/i).length).toBeGreaterThan(0);
    expect(screen.getByText(".XLSX")).toBeDefined();
    expect(screen.getByText("Anki .apkg")).toBeDefined();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <DeckImportModal
        isOpen={false}
        onClose={vi.fn()}
        targetDeck={mockDeck}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <DeckImportModal isOpen={true} onClose={onClose} targetDeck={mockDeck} />,
    );

    const closeBtn = screen.getByLabelText("Đóng cửa sổ");
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("handles CSV file upload and advances to Step 2 Preview", async () => {
    render(
      <DeckImportModal isOpen={true} onClose={vi.fn()} targetDeck={mockDeck} />,
    );

    const csvContent =
      "Front,Back,IPA\nResilient,Kiên cường,/rɪˈzɪliənt/\nEphemeral,Phù du,/ɪˈfemərəl/";
    const file = new File([csvContent], "vocabulary.csv", {
      type: "text/csv",
    });

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).toBeDefined();

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Khớp cột & Xem trước/i)).toBeDefined();
      expect(screen.getByText(/Resilient/i)).toBeDefined();
      expect(screen.getByText(/Kiên cường/i)).toBeDefined();
    });
  });
});
