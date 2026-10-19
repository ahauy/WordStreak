import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { OfficialDeckDetailPage } from "../pages/OfficialDeckDetailPage";
import { libraryService } from "../services/libraryService";

vi.mock("../services/libraryService", () => ({
  libraryService: {
    getOfficialDeckBySlug: vi.fn(),
    enrollOfficialDeck: vi.fn(),
  },
}));

vi.mock("../../dashboard/components/DashboardNavbar", () => ({
  DashboardNavbar: () => <div data-testid="mock-dashboard-navbar" />,
}));

const mockDetailResponse = {
  deck: {
    id: "deck-123",
    slug: "tsl-1a-office",
    title: "Office Operations",
    titleVi: "Nghiệp vụ văn phòng",
    description: "Bộ từ vựng công sở thiết yếu.",
    pathCode: "TOEIC",
    level: "T1",
    order: 1,
    listCode: "TSL",
    cardCount: 25,
    isEnrolled: false,
    masteredCount: 0,
  },
  cards: [
    {
      cardId: "card-1",
      order: 1,
      headword: "collaborate",
      pos: "v",
      content: {
        meaning_vi: "hợp tác, phối hợp",
        ipa_us: "/kəˈlæb.ə.reɪt/",
        example_en: "Teams collaborate on cross-functional initiatives.",
        example_vi: "Các nhóm hợp tác trong các sáng kiến liên phòng ban.",
        collocations: ["collaborate closely", "collaborate with"],
      },
      userStatus: null,
    },
    {
      cardId: "card-2",
      order: 2,
      headword: "negotiate",
      pos: "v",
      content: {
        meaning_vi: "đàm phán, thương lượng",
        ipa_us: "/nəˈɡoʊ.ʃi.eɪt/",
        example_en: "We negotiated a favorable contract.",
        example_vi: "Chúng tôi đã đàm phán một hợp đồng có lợi.",
      },
      userStatus: null,
    },
  ],
  isEnrolled: false,
  masteredCount: 0,
  totalCards: 2,
};

describe("OfficialDeckDetailPage (TC-LIB-03-006)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders deck header, metadata badges, and cards preview list", async () => {
    vi.mocked(libraryService.getOfficialDeckBySlug).mockResolvedValue(
      mockDetailResponse,
    );

    render(
      <MemoryRouter initialEntries={["/library/decks/tsl-1a-office"]}>
        <Routes>
          <Route
            path="/library/decks/:slug"
            element={<OfficialDeckDetailPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Office Operations")).toBeDefined();
      expect(screen.getByText("Nghiệp vụ văn phòng")).toBeDefined();
    });

    expect(screen.getByText("collaborate")).toBeDefined();
    expect(screen.getByText("hợp tác, phối hợp")).toBeDefined();
    expect(screen.getByText("/kəˈlæb.ə.reɪt/")).toBeDefined();

    expect(screen.getByText("negotiate")).toBeDefined();
    expect(screen.getByText("đàm phán, thương lượng")).toBeDefined();
  });

  it("triggers enrollOfficialDeck when clicking 'Thêm vào thư viện'", async () => {
    vi.mocked(libraryService.getOfficialDeckBySlug).mockResolvedValue(
      mockDetailResponse,
    );
    vi.mocked(libraryService.enrollOfficialDeck).mockResolvedValue({
      success: true,
      deckId: "deck-123",
      enrolledAt: new Date().toISOString(),
    });

    render(
      <MemoryRouter initialEntries={["/library/decks/tsl-1a-office"]}>
        <Routes>
          <Route
            path="/library/decks/:slug"
            element={<OfficialDeckDetailPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Thêm vào thư viện")).toBeDefined();
    });

    const enrollBtn = screen.getByText("Thêm vào thư viện");
    fireEvent.click(enrollBtn);

    await waitFor(() => {
      expect(libraryService.enrollOfficialDeck).toHaveBeenCalledWith("deck-123");
    });
  });
});
