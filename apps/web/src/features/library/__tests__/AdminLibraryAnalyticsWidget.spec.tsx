import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminLibraryAnalyticsWidget } from "../components/AdminLibraryAnalyticsWidget";
import { libraryService } from "../services/libraryService";
import type { LibraryAnalyticsSummaryResponse } from "@wordstreak/shared-types";

vi.mock("../services/libraryService", () => ({
  libraryService: {
    getLibraryAnalytics: vi.fn(),
  },
}));

const mockAnalyticsData: LibraryAnalyticsSummaryResponse = {
  totalEnrolledUsers: 42,
  activationRate: 85.0,
  firstValueRate: 60.5,
  avgTriageKnownRate: 24.2,
  totalFeedbacks: 5,
  deckStats: [
    {
      deckId: "deck-1",
      slug: "tsl-1a-office",
      title: "Office Operations",
      pathCode: "TSL",
      level: "T1",
      totalEnrolledUsers: 30,
      firstValueCompletionRate: 66.7,
      avgTriageKnownRate: 20.0,
      feedbackCount: 3,
      day1RetentionRate: 80.0,
      day7RetentionRate: 45.0,
    },
  ],
};

describe("AdminLibraryAnalyticsWidget (TC-ANL-003)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    vi.mocked(libraryService.getLibraryAnalytics).mockReturnValue(new Promise(() => {}));
    render(<AdminLibraryAnalyticsWidget />);
    expect(screen.getByText("Đang tổng hợp số liệu thư viện...")).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    vi.mocked(libraryService.getLibraryAnalytics).mockRejectedValue(new Error("Network Error"));
    render(<AdminLibraryAnalyticsWidget />);
    expect(await screen.findByText("Network Error")).toBeInTheDocument();
  });

  it("renders KPI cards and deck statistics table successfully", async () => {
    vi.mocked(libraryService.getLibraryAnalytics).mockResolvedValue(mockAnalyticsData);
    render(<AdminLibraryAnalyticsWidget />);

    expect(await screen.findByText("Hiệu quả & Đo lường Thư viện")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("60.5%")).toBeInTheDocument();
    expect(screen.getByText("24.2%")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    // Table rows
    expect(screen.getByText("Office Operations")).toBeInTheDocument();
    expect(screen.getByText("TSL T1")).toBeInTheDocument();
    expect(screen.getByText("66.7%")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
