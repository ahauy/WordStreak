import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { BusinessPathPage } from "../pages/BusinessPathPage";

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

vi.mock("../../dashboard/components/DashboardNavbar", () => ({
  DashboardNavbar: () => <div data-testid="mock-dashboard-navbar" />,
}));

describe("BusinessPathPage Component (Slice 12.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render business path title, coverage bar and all 50 decks by default", () => {
    render(
      <BrowserRouter>
        <BusinessPathPage />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Bản đồ Tiến trình Tiếng Anh Đi làm & Thương mại/i)).toBeInTheDocument();
    expect(screen.getByText(/50 Chặng · 1.700 Từ vựng Kinh doanh/i)).toBeInTheDocument();
    expect(screen.getByText(/Hiển thị: 50\/50 chặng/i)).toBeInTheDocument();
    expect(screen.getByText(/Quản trị Doanh nghiệp & HĐQT/i)).toBeInTheDocument();
  });

  it("should filter decks when clicking Finance sector tab", () => {
    render(
      <BrowserRouter>
        <BusinessPathPage />
      </BrowserRouter>,
    );

    const financeTab = screen.getByRole("tab", { name: /Tài chính & Kế toán/i });
    fireEvent.click(financeTab);

    expect(screen.getByText(/Hiển thị: 10\/50 chặng/i)).toBeInTheDocument();
    expect(screen.getByText(/Báo cáo Tài chính & Bảng Cân đối/i)).toBeInTheDocument();
    expect(screen.queryByText(/Quản trị Doanh nghiệp & HĐQT/i)).not.toBeInTheDocument();
  });

  it("should navigate to deck slug when clicking 'Học chặng'", () => {
    render(
      <BrowserRouter>
        <BusinessPathPage />
      </BrowserRouter>,
    );

    const studyButtons = screen.getAllByRole("button", { name: /Học chặng/i });
    fireEvent.click(studyButtons[0]);

    expect(mockedNavigate).toHaveBeenCalledWith("/library/decks/bsl-01-corporate-governance");
  });
});
