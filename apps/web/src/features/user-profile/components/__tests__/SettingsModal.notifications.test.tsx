import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../../locales/i18n";
import { SettingsModal } from "../SettingsModal";
import { useAuthStore } from "../../../../store/useAuthStore";
import { PUSH_STORAGE_KEY } from "../../../notifications/components/WebPushNotificationPrompt";
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

describe("SettingsModal Notifications Tab Integration (US-ECO-09)", () => {
  const originalNotification = window.Notification;

  const mockUser: AuthUser = {
    id: "u-settings-push-1",
    email: "push_user@wordstreak.io",
    username: "push_user",
    dailyGoal: 10,
    preferredLanguage: "vi",
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage("vi");
    vi.clearAllMocks();

    const requestPermissionMock = vi.fn().mockResolvedValue("granted");
    const mockNotificationClass = vi.fn();
    // @ts-expect-error mock assignment
    mockNotificationClass.permission = "default";
    // @ts-expect-error mock assignment
    mockNotificationClass.requestPermission = requestPermissionMock;
    // @ts-expect-error mock window
    window.Notification = mockNotificationClass;

    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
    });
  });

  afterEach(() => {
    if (originalNotification) {
      window.Notification = originalNotification;
    } else {
      // @ts-expect-error cleanup
      delete window.Notification;
    }
  });

  it("TC-SET-NOTIF-01: navigates to Notifications tab and displays push toggles", () => {
    renderSettingsModal(
      <SettingsModal isOpen={true} onClose={vi.fn()} initialTab="profile" />,
    );

    const notifTabBtn = screen.getByTestId("settings-tab-notifications");
    expect(notifTabBtn).toBeInTheDocument();
    fireEvent.click(notifTabBtn);

    expect(screen.getByText("Cài đặt Thông báo & Lời nhắc")).toBeInTheDocument();
    expect(
      screen.getByText("Thông báo đẩy trình duyệt (Web Push)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nhắc nhở ôn tập hàng ngày")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cảnh báo nguy cơ mất chuỗi ngọn lửa tím")
    ).toBeInTheDocument();
  });

  it("TC-SET-NOTIF-02: toggling Web Push switch requests notification permission", async () => {
    renderSettingsModal(
      <SettingsModal isOpen={true} onClose={vi.fn()} initialTab="notifications" />,
    );

    const pushToggle = screen.getByRole("switch", {
      name: "Bật tắt thông báo đẩy trình duyệt",
    });
    expect(pushToggle).toHaveAttribute("aria-checked", "false");

    fireEvent.click(pushToggle);

    expect(window.Notification.requestPermission).toHaveBeenCalled();
    await waitFor(() => {
      expect(localStorage.getItem(PUSH_STORAGE_KEY)).toBe("granted");
    });
  });

  it("TC-SET-NOTIF-03: toggles daily reminder and streak freeze alerts and updates localStorage", () => {
    renderSettingsModal(
      <SettingsModal isOpen={true} onClose={vi.fn()} initialTab="notifications" />,
    );

    const dailyToggle = screen.getByRole("switch", {
      name: "Nhắc nhở ôn tập hàng ngày",
    });
    expect(dailyToggle).toHaveAttribute("aria-checked", "true");
    fireEvent.click(dailyToggle);
    expect(dailyToggle).toHaveAttribute("aria-checked", "false");
    expect(localStorage.getItem("wordstreak_daily_reminder")).toBe("false");

    const streakToggle = screen.getByRole("switch", {
      name: "Cảnh báo đóng băng chuỗi ngọn lửa tím",
    });
    expect(streakToggle).toHaveAttribute("aria-checked", "true");
    fireEvent.click(streakToggle);
    expect(streakToggle).toHaveAttribute("aria-checked", "false");
    expect(localStorage.getItem("wordstreak_streak_alert")).toBe("false");
  });
});
