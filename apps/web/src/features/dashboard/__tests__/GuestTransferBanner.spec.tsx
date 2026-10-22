import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GuestTransferBanner } from "../components/GuestTransferBanner";
import {
  saveGuestPreviewState,
  clearGuestPreviewState,
} from "../../landing/utils/guestStorage";

describe("GuestTransferBanner Component (US-START-03)", () => {
  beforeEach(() => {
    localStorage.clear();
    clearGuestPreviewState();
  });

  it("TC-GUEST-010: does not render when no guest preview was completed", () => {
    const { container } = render(<GuestTransferBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("TC-GUEST-011: renders congratulatory banner when guest preview was completed", () => {
    saveGuestPreviewState({
      currentIndex: 5,
      reviewedCards: [
        { cardId: "guest-card-1", rating: 4, timestamp: 123 },
        { cardId: "guest-card-2", rating: 3, timestamp: 124 },
      ],
      isCompleted: true,
      completedAt: 125,
    });

    render(<GuestTransferBanner />);
    expect(screen.getByText(/bạn đã hoàn thành 5 từ học thử trước khi đăng ký/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /đã hiểu/i })).toBeInTheDocument();
  });

  it("TC-GUEST-012: dismissing the banner clears guest storage and hides banner", () => {
    saveGuestPreviewState({
      currentIndex: 5,
      reviewedCards: [{ cardId: "guest-card-1", rating: 4, timestamp: 123 }],
      isCompleted: true,
      completedAt: 125,
    });

    render(<GuestTransferBanner />);
    const dismissBtn = screen.getByRole("button", { name: /đã hiểu/i });
    fireEvent.click(dismissBtn);

    expect(screen.queryByText(/bạn đã hoàn thành 5 từ học thử/i)).toBeNull();
  });
});
