import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SpokenPathPage } from "../pages/SpokenPathPage";

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

describe("SpokenPathPage Component (Slice 12.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render spoken path title, coverage bar and all 24 decks by default", () => {
    render(
      <BrowserRouter>
        <SpokenPathPage />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Bản đồ Tiến trình Từ vựng & Hội thoại Giao tiếp/i)).toBeInTheDocument();
    expect(screen.getByText(/24 Chặng · 721 Từ vựng Giao tiếp/i)).toBeInTheDocument();
    expect(screen.getByText(/Hiển thị: 24\/24 chặng/i)).toBeInTheDocument();
    expect(screen.getByText(/Thói quen Buổi sáng & Chuyện Cafe/i)).toBeInTheDocument();
  });

  it("should filter decks when clicking Workplace context tab", () => {
    render(
      <BrowserRouter>
        <SpokenPathPage />
      </BrowserRouter>,
    );

    const workplaceTab = screen.getByRole("tab", { name: /Công sở Đàm thoại/i });
    fireEvent.click(workplaceTab);

    expect(screen.getByText(/Hiển thị: 5\/24 chặng/i)).toBeInTheDocument();
    expect(screen.getByText(/Trò chuyện Bên máy Nước & Tán gẫu/i)).toBeInTheDocument();
    expect(screen.queryByText(/Thói quen Buổi sáng & Chuyện Cafe/i)).not.toBeInTheDocument();
  });

  it("should navigate to deck slug when clicking 'Luyện đàm thoại'", () => {
    render(
      <BrowserRouter>
        <SpokenPathPage />
      </BrowserRouter>,
    );

    const studyButtons = screen.getAllByRole("button", { name: /Luyện đàm thoại/i });
    fireEvent.click(studyButtons[0]);

    expect(mockedNavigate).toHaveBeenCalledWith("/library/decks/ngsl-s-01-morning-routines");
  });
});
