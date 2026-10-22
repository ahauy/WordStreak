import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { IeltsAcademicPathPage } from "../pages/IeltsAcademicPathPage";

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

describe("IeltsAcademicPathPage Component (Slice 11.2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render path title, coverage bar and all 32 decks by default", () => {
    render(
      <BrowserRouter>
        <IeltsAcademicPathPage />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Bản đồ Tiến trình Từ vựng IELTS Academic/i)).toBeInTheDocument();
    expect(screen.getByText(/32 Chặng · 960 Từ vựng Học thuật/i)).toBeInTheDocument();
    expect(screen.getByText(/Hiển thị: 32\/32 chặng/i)).toBeInTheDocument();
    expect(screen.getByText(/Nền tảng Nghiên cứu & Dẫn chứng/i)).toBeInTheDocument();
    expect(screen.getByText(/Bảo vệ Luận án & Đỉnh cao Học thuật/i)).toBeInTheDocument();
  });

  it("should filter decks when clicking Band 5.5 - 6.5 tab", () => {
    render(
      <BrowserRouter>
        <IeltsAcademicPathPage />
      </BrowserRouter>,
    );

    const band5to6Tab = screen.getByRole("tab", { name: /Band 5.5 - 6.5/i });
    fireEvent.click(band5to6Tab);

    expect(screen.getByText(/Hiển thị: 10\/32 chặng/i)).toBeInTheDocument();
    expect(screen.getByText(/Nền tảng Nghiên cứu & Dẫn chứng/i)).toBeInTheDocument();
    expect(screen.queryByText(/Bảo vệ Luận án & Đỉnh cao Học thuật/i)).not.toBeInTheDocument();
  });

  it("should filter decks when clicking Band 7.5+ tab", () => {
    render(
      <BrowserRouter>
        <IeltsAcademicPathPage />
      </BrowserRouter>,
    );

    const band7PlusTab = screen.getByRole("tab", { name: /Band 7.5\+/i });
    fireEvent.click(band7PlusTab);

    expect(screen.getByText(/Hiển thị: 10\/32 chặng/i)).toBeInTheDocument();
    expect(screen.getByText(/Bảo vệ Luận án & Đỉnh cao Học thuật/i)).toBeInTheDocument();
    expect(screen.queryByText(/Nền tảng Nghiên cứu & Dẫn chứng/i)).not.toBeInTheDocument();
  });

  it("should navigate to deck slug when clicking 'Học chặng'", () => {
    render(
      <BrowserRouter>
        <IeltsAcademicPathPage />
      </BrowserRouter>,
    );

    const studyButtons = screen.getAllByRole("button", { name: /Học chặng/i });
    fireEvent.click(studyButtons[0]);

    expect(mockedNavigate).toHaveBeenCalledWith("/library/decks/nawl-01-research-foundations");
  });
});
