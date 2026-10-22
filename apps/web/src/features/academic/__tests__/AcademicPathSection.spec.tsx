import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AcademicPathSection } from "../components/AcademicPathSection";

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("AcademicPathSection Component (Slice 11.1)", () => {
  it("should render academic path banner and statistics", () => {
    renderWithRouter(<AcademicPathSection />);

    expect(screen.getByText(/Lộ trình IELTS & Học thuật/i)).toBeInTheDocument();
    expect(screen.getByText(/960 Academic Words/i)).toBeInTheDocument();
    expect(screen.getByText(/Nghiên cứu, Luận cứ & Dữ liệu Thực nghiệm/i)).toBeInTheDocument();
  });

  it("should filter decks by target band", () => {
    renderWithRouter(<AcademicPathSection />);

    const band7Btn = screen.getByRole("button", { name: /Band 7.5\+/i });
    fireEvent.click(band7Btn);

    expect(screen.getByText(/Xã hội, Quản trị & Thể chế Chính sách/i)).toBeInTheDocument();
    expect(screen.queryByText(/Môi trường, Khí hậu & Cân bằng Sinh thái/i)).not.toBeInTheDocument();

    const allBtn = screen.getByRole("button", { name: /Tất cả Band/i });
    fireEvent.click(allBtn);
    expect(screen.getByText(/Môi trường, Khí hậu & Cân bằng Sinh thái/i)).toBeInTheDocument();
  });

  it("should filter decks by topic", () => {
    renderWithRouter(<AcademicPathSection />);

    const logicBtn = screen.getByRole("button", { name: "Logic" });
    fireEvent.click(logicBtn);

    expect(screen.getByText(/Biện luận & Tư duy Phản biện Học thuật/i)).toBeInTheDocument();
    expect(screen.queryByText(/Môi trường, Khí hậu & Cân bằng Sinh thái/i)).not.toBeInTheDocument();
  });

  it("should open preview modal and show words list", () => {
    renderWithRouter(<AcademicPathSection />);

    const previewButtons = screen.getAllByRole("button", { name: /Xem trước/i });
    fireEvent.click(previewButtons[0]);

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(screen.getByText(/Bản tóm tắt bài báo nghiên cứu khoa học/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /Đóng/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should trigger onSelectDeck callback when click study button", () => {
    const handleSelect = vi.fn();
    renderWithRouter(<AcademicPathSection onSelectDeck={handleSelect} />);

    const studyButtons = screen.getAllByRole("button", { name: /Học bộ này/i });
    fireEvent.click(studyButtons[0]);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect.mock.calls[0][0].slug).toBe("nawl-research-evidence");
  });
});
