import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../../locales/i18n";
import { SettingsModal } from "../SettingsModal";
import { useAuthStore } from "../../../../store/useAuthStore";
import { userService } from "../../services/userService";
import { cancelPendingLanguageSync } from "../../../../lib/languageSync";
import { STORAGE_KEY } from "../../../../locales/constants";
import type { AuthUser } from "@wordstreak/shared-types";

vi.mock("../../services/userService", () => ({
  userService: {
    updateProfile: vi.fn(),
    getProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}));

vi.mock("../../../gamification/components/XpHistoryDrawer", () => ({
  XpHistoryDrawer: () => <div data-testid="xp-history-drawer">XP Drawer</div>,
}));

function renderSettingsModal(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

describe("SettingsModal Language Tab Integration (US-I18N-03 / REQ-I18N-SYNC-004)", () => {
  const mockUser: AuthUser = {
    id: "u-settings-1",
    email: "settings_user@wordstreak.io",
    username: "settings_user",
    dailyGoal: 10,
    preferredLanguage: "vi",
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    localStorage.clear();
    await i18n.changeLanguage("vi");
    cancelPendingLanguageSync();
    vi.clearAllMocks();

    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
    });
  });

  afterEach(() => {
    cancelPendingLanguageSync();
    vi.useRealTimers();
  });

  it("renders Language & Region tab and displays active locale selection", () => {
    renderSettingsModal(
      <SettingsModal isOpen={true} onClose={vi.fn()} initialTab="language" />,
    );

    expect(screen.getByTestId("language-settings-tab")).toBeInTheDocument();
    expect(screen.getByTestId("language-card-vi")).toBeInTheDocument();
    expect(screen.getByTestId("language-card-en")).toBeInTheDocument();

    expect(screen.getByText(/Tiếng Việt/i)).toBeInTheDocument();
    expect(screen.getByText(/English \(US\)/i)).toBeInTheDocument();
  });

  it("switches language to English on card click and triggers debounced sync", async () => {
    vi.mocked(userService.updateProfile).mockResolvedValueOnce({
      ...mockUser,
      preferredLanguage: "en",
    });

    renderSettingsModal(
      <SettingsModal isOpen={true} onClose={vi.fn()} initialTab="language" />,
    );

    const englishCard = screen.getByTestId("language-card-en");
    fireEvent.click(englishCard);

    // Instant optimistic transition
    expect(i18n.language).toBe("en");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("en");

    // Debounced API call not sent immediately
    expect(userService.updateProfile).not.toHaveBeenCalled();

    // Advance 300ms
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(userService.updateProfile).toHaveBeenCalledWith({
      preferredLanguage: "en",
    });
  });

  it("navigates from Profile tab to Language tab via tab navigation button", () => {
    renderSettingsModal(
      <SettingsModal isOpen={true} onClose={vi.fn()} initialTab="profile" />,
    );

    const languageTabButton = screen.getByTestId("settings-tab-language");
    fireEvent.click(languageTabButton);

    expect(screen.getByTestId("language-settings-tab")).toBeInTheDocument();
  });
});
