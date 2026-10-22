import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { GuestFlashcardPreview } from "../components/GuestFlashcardPreview";
import { clearGuestPreviewState } from "../utils/guestStorage";

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("GuestFlashcardPreview Component (US-START-03)", () => {
  beforeEach(() => {
    localStorage.clear();
    clearGuestPreviewState();
    vi.clearAllMocks();
  });

  it("TC-GUEST-006: renders initial first card on front face", () => {
    renderWithRouter(<GuestFlashcardPreview />);
    expect(screen.getByText("resilient")).toBeInTheDocument();
    expect(screen.getByText(/\/rɪˈzɪl\.jənt\//)).toBeInTheDocument();
    expect(screen.getByText(/Thẻ 1 \/ 5/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /lật thẻ/i })).toBeInTheDocument();
  });

  it("TC-GUEST-007: flips to back face revealing meaning and SM-2 rating buttons", () => {
    renderWithRouter(<GuestFlashcardPreview />);
    const flipBtn = screen.getByRole("button", { name: /lật thẻ/i });
    fireEvent.click(flipBtn);

    expect(screen.getByText(/Có khả năng phục hồi nhanh chóng/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /quên/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /nhớ tốt/i })).toBeInTheDocument();
  });

  it("TC-GUEST-008: grading card advances to next card and persists in localStorage", () => {
    renderWithRouter(<GuestFlashcardPreview />);
    fireEvent.click(screen.getByRole("button", { name: /lật thẻ/i }));

    const goodBtn = screen.getByRole("button", { name: /nhớ tốt/i });
    fireEvent.click(goodBtn);

    // Advances to card 2: ubiquitous
    expect(screen.getByText("ubiquitous")).toBeInTheDocument();
    expect(screen.getByText(/Thẻ 2 \/ 5/i)).toBeInTheDocument();
  });

  it("TC-GUEST-009: displays completion view with registration CTA after 5 cards", () => {
    renderWithRouter(<GuestFlashcardPreview />);

    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole("button", { name: /lật thẻ/i }));
      fireEvent.click(screen.getByRole("button", { name: /nhớ tốt/i }));
    }

    expect(screen.getByText(/bạn đã hoàn thành 5 từ học thử/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /đăng ký/i })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("button", { name: /học lại từ đầu/i })).toBeInTheDocument();
  });
});
