import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ToeicPathPage } from "../pages/ToeicPathPage";
import { libraryService } from "../services/libraryService";

vi.mock("../services/libraryService", () => ({
  libraryService: {
    getToeicPathProgress: vi.fn(),
  },
}));

vi.mock("../../dashboard/components/DashboardNavbar", () => ({
  DashboardNavbar: () => <div data-testid="mock-dashboard-navbar" />,
}));

const mockProgressResponse = {
  coveragePercent: 88.5,
  ngslCoveragePercent: 85.0,
  tslCoveragePercent: 3.5,
  maxEstimatedCoverage: 98.5,
  totalDecks: 48,
  completedDecks: 12,
  totalWords: 1200,
  masteredWords: 300,
  knownSkippedWords: 50,
  estimatedDaysRemaining: 85,
  dailyGoal: 10,
  levels: [
    {
      level: "T1",
      title: "Cơ bản - Nền tảng văn phòng (400 từ đầu)",
      totalDecks: 16,
      completedDecks: 12,
      totalCards: 400,
      learnedCards: 350,
      progressPercent: 87.5,
      decks: [
        {
          deckId: "d1",
          slug: "tsl-1a-office",
          title: "Office Operations",
          titleVi: "Nghiệp vụ văn phòng",
          level: "T1",
          order: 1,
          totalCards: 25,
          masteredCount: 20,
          knownSkippedCount: 5,
          learningCount: 0,
          isCompleted: true,
        },
      ],
    },
    {
      level: "T2",
      title: "Trung cấp - Hoạt động thương mại (401-800)",
      totalDecks: 16,
      completedDecks: 0,
      totalCards: 400,
      learnedCards: 0,
      progressPercent: 0,
      decks: [
        {
          deckId: "d17",
          slug: "tsl-2a-trade",
          title: "Trade & Commerce",
          titleVi: "Thương mại & Giao dịch",
          level: "T2",
          order: 17,
          totalCards: 25,
          masteredCount: 0,
          knownSkippedCount: 0,
          learningCount: 0,
          isCompleted: false,
        },
      ],
    },
  ],
};

describe("ToeicPathPage (TC-LIB-06-003)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title, coverage bar, and level details on load", async () => {
    vi.mocked(libraryService.getToeicPathProgress).mockResolvedValue(
      mockProgressResponse,
    );

    render(
      <MemoryRouter>
        <ToeicPathPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Đang tải bản đồ lộ trình...")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("Bản đồ Tiến trình Từ vựng TOEIC"),
      ).toBeInTheDocument();
      expect(screen.getByText("88.5%")).toBeInTheDocument();
      expect(screen.getByText("12 / 48 bộ")).toBeInTheDocument();
      expect(screen.getByText("~85 ngày")).toBeInTheDocument();
    });

    // Check deck in active level
    expect(screen.getByText("Nghiệp vụ văn phòng")).toBeInTheDocument();
    expect(screen.getByText("Đã xong")).toBeInTheDocument();
  });

  it("switches levels when clicking level buttons", async () => {
    vi.mocked(libraryService.getToeicPathProgress).mockResolvedValue(
      mockProgressResponse,
    );

    render(
      <MemoryRouter>
        <ToeicPathPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Cấp T1")).toBeInTheDocument();
    });

    const t2Btn = screen.getByText("Cấp T2");
    fireEvent.click(t2Btn);

    expect(screen.getByText("Thương mại & Giao dịch")).toBeInTheDocument();
    expect(screen.getByText("Chưa học")).toBeInTheDocument();
  });

  it("handles error state when service rejects", async () => {
    vi.mocked(libraryService.getToeicPathProgress).mockRejectedValue(
      new Error("Lỗi mạng máy chủ"),
    );

    render(
      <MemoryRouter>
        <ToeicPathPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Lỗi mạng máy chủ")).toBeInTheDocument();
      expect(screen.getByText("Thử lại")).toBeInTheDocument();
    });
  });
});
