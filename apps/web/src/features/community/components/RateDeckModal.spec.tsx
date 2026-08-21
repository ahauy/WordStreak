import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RateDeckModal } from "./RateDeckModal";
import { communityService } from "../services/communityService";
import type { CommunityDeckItem } from "@wordstreak/shared-types";

vi.mock("../services/communityService", () => ({
  communityService: {
    rateDeck: vi.fn(),
  },
}));

const mockDeck: CommunityDeckItem = {
  id: "deck-rate-1",
  title: "Oxford 3000 Essentials",
  description: "Core vocabulary",
  color: "#6366F1",
  icon: "Book",
  coverImageUrl: null,
  category: "General English",
  tags: ["oxford"],
  totalCards: 20,
  cloneCount: 50,
  averageRating: 4.5,
  totalRatings: 10,
  author: {
    id: "author-1",
    name: "oxford_teacher",
    username: "oxford_teacher",
    avatarUrl: null,
  },
  createdAt: "2026-08-01T00:00:00Z",
  updatedAt: "2026-08-01T00:00:00Z",
};

describe("RateDeckModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal with stars and submits rating successfully", async () => {
    vi.mocked(communityService.rateDeck).mockResolvedValue({
      success: true,
      averageRating: 4.8,
      totalRatings: 11,
      userRating: { rating: 5, comment: "Excellent content!" },
      message: "Success",
    });

    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <RateDeckModal
        deck={mockDeck}
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText("Đánh giá bộ từ vựng")).toBeInTheDocument();
    expect(screen.getByText("Oxford 3000 Essentials")).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(
      /Chia sẻ cảm nhận về chất lượng thẻ từ/i,
    );
    fireEvent.change(textarea, { target: { value: "Excellent content!" } });

    const submitBtn = screen.getByRole("button", { name: /Gửi đánh giá/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(communityService.rateDeck).toHaveBeenCalledWith("deck-rate-1", {
        rating: 5,
        comment: "Excellent content!",
      });
    });
  });
});
