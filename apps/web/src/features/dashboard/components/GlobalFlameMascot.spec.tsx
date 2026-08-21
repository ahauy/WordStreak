import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { GlobalFlameMascot } from "./GlobalFlameMascot";
import { useAuthStore } from "../../../store/useAuthStore";
import { useMascotStore } from "../../../store/useMascotStore";

vi.mock("../../../store/useAuthStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("../hooks/useStreak", () => ({
  useStreak: () => ({
    currentStreak: 5,
    bestStreak: 12,
    streakFreezes: 1,
    maxStreakFreezes: 2,
    wasProtectedByFreeze: false,
    dismissFreezeSavedNotice: vi.fn(),
  }),
}));

describe("GlobalFlameMascot Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMascotStore.setState({
      isFlameNurtureOpen: false,
      feedingTrigger: null,
    });
  });

  it("does not render when user is not logged in", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
    } as ReturnType<typeof useAuthStore>);

    const { container } = render(
      <BrowserRouter>
        <GlobalFlameMascot />
      </BrowserRouter>,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders mascot and opens nurture modal when triggered", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        dailyGoal: 10,
      },
    } as ReturnType<typeof useAuthStore>);

    render(
      <BrowserRouter>
        <GlobalFlameMascot />
      </BrowserRouter>,
    );

    // Mascot is rendered via portal
    const mascot = screen.getByTitle(/Ngọn Lửa Đồng Hành/i);
    expect(mascot).toBeDefined();

    // Click mascot opens modal
    fireEvent.click(mascot);
    expect(useMascotStore.getState().isFlameNurtureOpen).toBe(true);
  });
});
