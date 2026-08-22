import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../../locales/i18n";
import { DashboardNavbar } from "../DashboardNavbar";
import { Header } from "../../../../components/layout/Header";

// Mock Mascot & Auth store
vi.mock("../../../../store/useAuthStore", () => ({
  useAuthStore: () => ({
    user: { id: "u-1", username: "StreakMaster", avatarUrl: "" },
    logout: vi.fn(),
  }),
}));

vi.mock("../../../../store/useMascotStore", () => ({
  useMascotStore: {
    getState: () => ({
      openFlameNurture: vi.fn(),
    }),
  },
}));

vi.mock("../../hooks/useStreak", () => ({
  useStreak: () => ({
    currentStreak: 7,
    flameTier: 2,
    isActiveToday: true,
    isLoading: false,
  }),
}));

function renderNavbar(ui: React.ReactElement) {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>{ui}</MemoryRouter>
    </I18nextProvider>,
  );
}

describe("DashboardNavbar i18n Integration (TC-I18N-006)", () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage("vi");
  });

  it("renders localized navigation links in Vietnamese by default", () => {
    renderNavbar(<DashboardNavbar />);

    expect(screen.getByText("Tổng quan")).toBeInTheDocument();
    expect(screen.getByText("Bộ từ vựng")).toBeInTheDocument();
    expect(screen.getByText("Khám phá")).toBeInTheDocument();
    expect(screen.getByText("Thống kê")).toBeInTheDocument();
  });

  it("toggles navigation links to English when LanguageSwitcher is clicked", async () => {
    renderNavbar(<DashboardNavbar />);

    const switcherButton = screen.getByRole("button", {
      name: /switch to english/i,
    });
    expect(switcherButton).toBeInTheDocument();

    fireEvent.click(switcherButton);

    expect(i18n.language).toBe("en");
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Decks")).toBeInTheDocument();
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("works transparently through Header wrapper component", async () => {
    renderNavbar(<Header />);

    expect(screen.getByText("Tổng quan")).toBeInTheDocument();
    const switcherButton = screen.getByRole("button", {
      name: /switch to english/i,
    });
    fireEvent.click(switcherButton);

    expect(screen.getByText("Overview")).toBeInTheDocument();
  });
});
