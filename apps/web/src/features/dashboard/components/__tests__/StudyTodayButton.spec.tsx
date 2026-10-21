import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { StudyTodayButton } from "../StudyTodayButton";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("StudyTodayButton (US-UX-01 / TC-UX-01-003, TC-UX-01-004)", () => {
  it("renders due cards count when dueCount > 0 and navigates to /review with autoMix state on click", () => {
    render(
      <BrowserRouter>
        <StudyTodayButton totalCount={10} dueCount={4} newCount={6} />
      </BrowserRouter>,
    );

    const button = screen.getByTestId("study-today-button");
    expect(button).toBeDefined();
    expect(screen.getByText(/4 thẻ đến hạn|Ôn tập ngay/i)).toBeDefined();

    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith("/review", {
      state: { autoMix: true, todaySession: true },
    });
  });

  it("renders new cards count when dueCount === 0 and totalCount > 0", () => {
    render(
      <BrowserRouter>
        <StudyTodayButton totalCount={5} dueCount={0} newCount={5} />
      </BrowserRouter>,
    );

    const button = screen.getByTestId("study-today-button");
    expect(button).toBeDefined();
    expect(screen.getByText(/5 thẻ|Học từ mới/i)).toBeDefined();
  });

  it("renders completed state when totalCount === 0 or isCompleted is true", () => {
    render(
      <BrowserRouter>
        <StudyTodayButton totalCount={0} isCompleted={true} />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("study-today-completed")).toBeDefined();
    expect(screen.queryByTestId("study-today-button")).toBeNull();
    expect(screen.getByText(/Mục tiêu hôm nay đã hoàn thành/i)).toBeDefined();
  });
});
