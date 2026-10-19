import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { LibraryPage } from "../pages/LibraryPage";
import { libraryService } from "../services/libraryService";

vi.mock("../services/libraryService", () => ({
  libraryService: {
    getOfficialDecks: vi.fn(),
    enrollOfficialDeck: vi.fn(),
  },
}));

vi.mock("../../dashboard/components/DashboardNavbar", () => ({
  DashboardNavbar: () => <div data-testid="mock-dashboard-navbar" />,
}));

const mockDecksResponse = {
  decks: [
    {
      id: "deck-1",
      slug: "tsl-1a-office",
      title: "Office Operations",
      titleVi: "Nghiệp vụ văn phòng",
      description: "25 high-frequency workplace vocabulary words.",
      pathCode: "TOEIC",
      level: "T1",
      order: 1,
      listCode: "TSL",
      cardCount: 25,
      isEnrolled: false,
      masteredCount: 0,
    },
    {
      id: "deck-2",
      slug: "ngsl-foundation-1",
      title: "Essential Everyday 1",
      titleVi: "Từ vựng sinh hoạt 1",
      description: "Foundation words.",
      pathCode: "FOUNDATION",
      level: "T1",
      order: 2,
      listCode: "NGSL",
      cardCount: 25,
      isEnrolled: true,
      masteredCount: 15,
    },
  ],
  total: 2,
  page: 1,
  limit: 50,
  totalPages: 1,
};

describe("LibraryPage (TC-LIB-03-005)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page header, path tabs, and deck cards", async () => {
    vi.mocked(libraryService.getOfficialDecks).mockResolvedValue(
      mockDecksResponse,
    );

    render(
      <BrowserRouter>
        <LibraryPage />
      </BrowserRouter>,
    );

    expect(screen.getByText("Thư viện Từ vựng Chính thức")).toBeDefined();
    expect(screen.getByText("Tất cả lộ trình")).toBeDefined();
    expect(screen.getByText("TOEIC Mastery (TSL)")).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText("Office Operations")).toBeDefined();
      expect(screen.getByText("Nghiệp vụ văn phòng")).toBeDefined();
      expect(screen.getByText("Essential Everyday 1")).toBeDefined();
    });

    expect(screen.getByText("Thêm vào thư viện")).toBeDefined();
    expect(screen.getByText("Học ngay")).toBeDefined();
  });

  it("filters decks when selecting a path tab", async () => {
    vi.mocked(libraryService.getOfficialDecks).mockResolvedValue(
      mockDecksResponse,
    );

    render(
      <BrowserRouter>
        <LibraryPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Office Operations")).toBeDefined();
    });

    const toeicTab = screen.getByText("TOEIC Mastery (TSL)");
    fireEvent.click(toeicTab);

    expect(libraryService.getOfficialDecks).toHaveBeenCalledWith(
      expect.objectContaining({ pathCode: "TOEIC" }),
    );
  });

  it("calls enrollOfficialDeck when clicking 'Thêm vào thư viện'", async () => {
    vi.mocked(libraryService.getOfficialDecks).mockResolvedValue(
      mockDecksResponse,
    );
    vi.mocked(libraryService.enrollOfficialDeck).mockResolvedValue({
      success: true,
      deckId: "deck-1",
      enrolledAt: new Date().toISOString(),
    });

    render(
      <BrowserRouter>
        <LibraryPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Thêm vào thư viện")).toBeDefined();
    });

    const enrollBtn = screen.getByText("Thêm vào thư viện");
    fireEvent.click(enrollBtn);

    await waitFor(() => {
      expect(libraryService.enrollOfficialDeck).toHaveBeenCalledWith("deck-1");
    });
  });
});
