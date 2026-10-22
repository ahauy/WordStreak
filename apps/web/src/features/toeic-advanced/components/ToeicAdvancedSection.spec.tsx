import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ToeicAdvancedSection } from "./ToeicAdvancedSection";

describe("ToeicAdvancedSection (US-LIB-17)", () => {
  it("TC-TOEIC-ADV-01: renders specialized modules header, badges and summary", () => {
    render(<ToeicAdvancedSection />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Bộ Từ Vựng Chuyên Biệt & Chiến Thuật Điểm Cao",
      })
    ).toBeInTheDocument();

    expect(screen.getByText("Part 5 Strategy")).toBeInTheDocument();
    expect(screen.getByText("100 Cụm từ cố định Part 5 & 6 (Fixed Collocations)")).toBeInTheDocument();
    expect(screen.getByText("50 Cụm Từ Miêu Tả Tranh Part 1 (Photo Decks)")).toBeInTheDocument();
  });

  it("TC-TOEIC-ADV-02: renders all 4 collocations decks and 2 photo decks", () => {
    render(<ToeicAdvancedSection />);

    // 4 collocations decks
    expect(screen.getByText("Cụm Giới từ & Động từ Cố định")).toBeInTheDocument();
    expect(screen.getByText("Cụm Từ Thương mại & Hợp đồng")).toBeInTheDocument();
    expect(screen.getByText("Cụm Từ Nhân sự & Vận hành")).toBeInTheDocument();
    expect(screen.getByText("Cụm Giới từ Chỉ Thời gian & Điều kiện")).toBeInTheDocument();

    // 2 photo decks
    expect(screen.getByText("Hành động Con người Part 1")).toBeInTheDocument();
    expect(screen.getByText("Bối cảnh Không gian & Đồ vật Part 1")).toBeInTheDocument();
  });

  it("TC-TOEIC-ADV-03: opens modal preview when clicking 'Xem danh sách cụm từ'", () => {
    render(<ToeicAdvancedSection />);

    const openBtns = screen.getAllByRole("button", { name: /Xem danh sách cụm từ/i });
    fireEvent.click(openBtns[0]);

    // Modal dialog should appear
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Cụm Giới từ & Động từ Cố định")).toBeInTheDocument();
    expect(within(dialog).getByText(/be responsible for/i)).toBeInTheDocument();

    // Close button
    const closeBtn = within(dialog).getByRole("button", { name: "Đóng cửa sổ" });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("TC-TOEIC-ADV-04: opens modal preview when clicking 'Xem danh sách từ tranh'", () => {
    render(<ToeicAdvancedSection />);

    const openPhotoBtns = screen.getAllByRole("button", { name: /Xem danh sách từ tranh/i });
    fireEvent.click(openPhotoBtns[0]);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Hành động Con người Part 1")).toBeInTheDocument();
    expect(within(dialog).getByText(/inspecting documents/i)).toBeInTheDocument();

    // Close via bottom button
    const closeBottomBtn = within(dialog).getByRole("button", { name: "Đóng" });
    fireEvent.click(closeBottomBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("TC-TOEIC-ADV-05: opens Part 5 lesson and allows answering interactive quiz", () => {
    render(<ToeicAdvancedSection />);

    const openLessonBtn = screen.getByRole("button", { name: /Xem chiến thuật 2 phút/i });
    fireEvent.click(openLessonBtn);

    // Modal open
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Chiến thuật Loại trừ Dạng từ Part 5")).toBeInTheDocument();
    expect(within(dialog).getByText("4 Vị Trí Vàng Nhận Diện Chỗ Trống Part 5")).toBeInTheDocument();

    // Find quiz question and click option C (successfully)
    const optionC = within(dialog).getByRole("button", { name: /\(C\) successfully/i });
    fireEvent.click(optionC);

    expect(within(dialog).getByText(/Chính xác! Đáp án đúng là C/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Chỗ trống đứng cuối mệnh đề đầy đủ/i)).toBeInTheDocument();

    // Close lesson
    const finishBtn = within(dialog).getByRole("button", { name: "Hoàn thành bài học" });
    fireEvent.click(finishBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
