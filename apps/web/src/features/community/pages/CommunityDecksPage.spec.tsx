import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { CommunityDecksPage } from "./CommunityDecksPage";
import { communityService } from "../services/communityService";
import type { CommunityDeckItem } from "@wordstreak/shared-types";

vi.mock("../services/communityService", () => ({
  communityService: {
    getCommunityDecks: vi.fn(),
    getCommunityDeckDetail: vi.fn(),
    cloneDeck: vi.fn(),
    rateDeck: vi.fn(),
  },
}));

const mockDecks: CommunityDeckItem[] = [
  {
    id: "deck-1",
    title: "IELTS Academic Master 1000",
    description: "Essential academic vocabulary with collocations",
    color: "#6366F1",
    icon: "Book",
    coverImageUrl: null,
    category: "IELTS",
    tags: ["academic", "ielts"],
    totalCards: 50,
    cloneCount: 120,
    averageRating: 4.9,
    totalRatings: 35,
    author: {
      id: "u-1",
      name: "ielts_master",
      username: "ielts_master",
      avatarUrl: null,
    },
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    isOwner: false,
  },
  {
    id: "deck-2",
    title: "Business English Idioms",
    description: "Corporate expressions for meetings",
    color: "#10B981",
    icon: "Briefcase",
    coverImageUrl: null,
    category: "Business English",
    tags: ["business"],
    totalCards: 30,
    cloneCount: 85,
    averageRating: 4.7,
    totalRatings: 18,
    author: {
      id: "u-2",
      name: "corporate_pro",
      username: "corporate_pro",
      avatarUrl: null,
    },
    createdAt: "2026-08-05T00:00:00Z",
    updatedAt: "2026-08-05T00:00:00Z",
    isOwner: false,
  },
];

describe("CommunityDecksPage (US-ECO-02)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page header, category chips, and public deck cards", async () => {
    vi.mocked(communityService.getCommunityDecks).mockResolvedValue({
      items: mockDecks,
      meta: {
        totalItems: 2,
        itemCount: 2,
        itemsPerPage: 12,
        totalPages: 1,
        currentPage: 1,
      },
    });

    render(
      <MemoryRouter>
        <CommunityDecksPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Khám phá Bộ từ vựng chia sẻ")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("IELTS Academic Master 1000"),
      ).toBeInTheDocument();
      expect(screen.getByText("Business English Idioms")).toBeInTheDocument();
    });

    expect(screen.getByText("ielts_master")).toBeInTheDocument();
    expect(screen.getByText("corporate_pro")).toBeInTheDocument();
  });

  it("filters decks when searching in the search box", async () => {
    vi.mocked(communityService.getCommunityDecks).mockResolvedValue({
      items: [mockDecks[0]],
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 12,
        totalPages: 1,
        currentPage: 1,
      },
    });

    render(
      <MemoryRouter>
        <CommunityDecksPage />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên bộ từ/i);
    fireEvent.change(searchInput, { target: { value: "IELTS" } });

    await waitFor(() => {
      expect(communityService.getCommunityDecks).toHaveBeenCalledWith(
        expect.objectContaining({ search: "IELTS" }),
      );
    });
  });

  it("triggers 1-click clone action and displays success feedback", async () => {
    vi.mocked(communityService.getCommunityDecks).mockResolvedValue({
      items: [mockDecks[0]],
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 12,
        totalPages: 1,
        currentPage: 1,
      },
    });

    vi.mocked(communityService.cloneDeck).mockResolvedValue({
      success: true,
      clonedDeckId: "cloned-123",
      clonedDeckTitle: "IELTS Academic Master 1000 (Bản sao)",
      totalCardsCloned: 50,
      message: "Đã sao chép thành công bộ từ vào thư viện cá nhân!",
    });

    render(
      <MemoryRouter>
        <CommunityDecksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("IELTS Academic Master 1000"),
      ).toBeInTheDocument();
    });

    const cloneButton = screen.getByRole("button", { name: /Sao chép/i });
    fireEvent.click(cloneButton);

    await waitFor(() => {
      expect(communityService.cloneDeck).toHaveBeenCalledWith("deck-1");
      expect(screen.getByText(/Đã sao chép thành công/i)).toBeInTheDocument();
    });
  });
});
