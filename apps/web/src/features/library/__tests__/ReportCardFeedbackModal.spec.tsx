import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReportCardFeedbackModal } from "../components/ReportCardFeedbackModal";
import { libraryService } from "../services/libraryService";

vi.mock("../services/libraryService", () => ({
  libraryService: {
    submitCardFeedback: vi.fn(),
  },
}));

describe("ReportCardFeedbackModal (TC-FB-004)", () => {
  const defaultProps = {
    isOpen: true,
    cardId: "card-123",
    cardHeadword: "abandon",
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(<ReportCardFeedbackModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Báo lỗi nội dung thẻ")).not.toBeInTheDocument();
  });

  it("does not render when cardId is null", () => {
    render(<ReportCardFeedbackModal {...defaultProps} cardId={null} />);
    expect(screen.queryByText("Báo lỗi nội dung thẻ")).not.toBeInTheDocument();
  });

  it("renders card headword and list of feedback reasons", () => {
    render(<ReportCardFeedbackModal {...defaultProps} />);
    expect(screen.getByText("Báo lỗi nội dung thẻ")).toBeInTheDocument();
    expect(screen.getByText("abandon")).toBeInTheDocument();
    expect(screen.getByText("Nghĩa chưa chuẩn")).toBeInTheDocument();
    expect(screen.getByText("Lỗi chính tả / phiên âm")).toBeInTheDocument();
    expect(screen.getByText("Âm thanh lỗi")).toBeInTheDocument();
    expect(screen.getByText("Ví dụ thiếu tự nhiên")).toBeInTheDocument();
  });

  it("submits feedback and calls libraryService.submitCardFeedback", async () => {
    vi.mocked(libraryService.submitCardFeedback).mockResolvedValue({
      id: "fb-1",
      cardId: "card-123",
      userId: "u-1",
      reason: "TYPO",
      comment: "Typo in example sentence",
      status: "OPEN",
      createdAt: new Date(),
    });

    render(<ReportCardFeedbackModal {...defaultProps} />);

    // Select "Lỗi chính tả / phiên âm"
    const typoRadio = screen.getByLabelText(/Lỗi chính tả/i);
    fireEvent.click(typoRadio);

    // Enter comment
    const commentInput = screen.getByPlaceholderText(/Ví dụ: Nghĩa chuẩn/i);
    fireEvent.change(commentInput, { target: { value: "Typo in example sentence" } });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: "Gửi báo lỗi" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(libraryService.submitCardFeedback).toHaveBeenCalledWith(
        "card-123",
        "TYPO",
        "Typo in example sentence",
      );
    });

    expect(await screen.findByText("Cảm ơn bạn đã đóng góp!")).toBeInTheDocument();
  });
});
