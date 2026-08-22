import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../locales/i18n";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useAuthStore } from "../../../store/useAuthStore";
import { userService } from "../../../features/user-profile/services/userService";
import { cancelPendingLanguageSync } from "../../../lib/languageSync";
import type { AuthUser } from "@wordstreak/shared-types";

vi.mock("../../../features/user-profile/services/userService", () => ({
  userService: {
    updateProfile: vi.fn(),
    getProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}));

function renderSwitcher(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

describe("LanguageSwitcher Optimistic Switch & Sync (US-I18N-03 / REQ-I18N-SYNC-004)", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    localStorage.clear();
    await i18n.changeLanguage("en");
    cancelPendingLanguageSync();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cancelPendingLanguageSync();
    vi.useRealTimers();
  });

  it("triggers debounced userService.updateProfile when authenticated user clicks switcher", async () => {
    const mockUser: AuthUser = {
      id: "u-auth-1",
      email: "learner@wordstreak.io",
      username: "learner",
      dailyGoal: 10,
      preferredLanguage: "en",
      createdAt: new Date().toISOString(),
    };

    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
    });

    vi.mocked(userService.updateProfile).mockResolvedValueOnce({
      ...mockUser,
      preferredLanguage: "vi",
    });

    renderSwitcher(<LanguageSwitcher />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("EN");

    // Click toggle to switch EN -> VI
    fireEvent.click(button);

    // Instant optimistic UI switch (<16ms)
    expect(i18n.language).toBe("vi");
    expect(button).toHaveTextContent("VI");

    // Profile sync not dispatched immediately (debouncing)
    expect(userService.updateProfile).not.toHaveBeenCalled();

    // Advance debounce timer by 300ms
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(userService.updateProfile).toHaveBeenCalledTimes(1);
    expect(userService.updateProfile).toHaveBeenCalledWith({
      preferredLanguage: "vi",
    });
  });

  it("debounces rapid consecutive clicks and dispatches only 1 API call with final state", async () => {
    const mockUser: AuthUser = {
      id: "u-auth-2",
      email: "rapid@wordstreak.io",
      username: "rapid_clicker",
      dailyGoal: 10,
      preferredLanguage: "en",
      createdAt: new Date().toISOString(),
    };

    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
    });

    vi.mocked(userService.updateProfile).mockResolvedValue({
      ...mockUser,
      preferredLanguage: "vi",
    });

    renderSwitcher(<LanguageSwitcher />);
    const button = screen.getByRole("button");

    // 5 rapid clicks in 100ms
    fireEvent.click(button); // EN -> VI
    act(() => {
      vi.advanceTimersByTime(20);
    });
    fireEvent.click(button); // VI -> EN
    act(() => {
      vi.advanceTimersByTime(20);
    });
    fireEvent.click(button); // EN -> VI
    act(() => {
      vi.advanceTimersByTime(20);
    });
    fireEvent.click(button); // VI -> EN
    act(() => {
      vi.advanceTimersByTime(20);
    });
    fireEvent.click(button); // EN -> VI

    // No API calls before debounce completes
    expect(userService.updateProfile).not.toHaveBeenCalled();

    // Advance beyond 300ms from the final click
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Exactly 1 call with the final state 'vi'
    expect(userService.updateProfile).toHaveBeenCalledTimes(1);
    expect(userService.updateProfile).toHaveBeenCalledWith({
      preferredLanguage: "vi",
    });
  });

  it("does not call userService.updateProfile when unauthenticated guest toggles language", async () => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });

    renderSwitcher(<LanguageSwitcher />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    expect(i18n.language).toBe("vi");

    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    expect(userService.updateProfile).not.toHaveBeenCalled();
  });

  it("handles network failure gracefully without reverting UI or throwing error", async () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const mockUser: AuthUser = {
      id: "u-offline",
      email: "offline@wordstreak.io",
      username: "offline_user",
      dailyGoal: 10,
      preferredLanguage: "en",
      createdAt: new Date().toISOString(),
    };

    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
    });

    vi.mocked(userService.updateProfile).mockRejectedValueOnce(
      new Error("Network Error"),
    );

    renderSwitcher(<LanguageSwitcher />);
    const button = screen.getByRole("button");

    fireEvent.click(button);
    expect(i18n.language).toBe("vi");

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(userService.updateProfile).toHaveBeenCalledWith({
      preferredLanguage: "vi",
    });
    // UI remains in 'vi' (does not revert or crash)
    expect(i18n.language).toBe("vi");
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});
