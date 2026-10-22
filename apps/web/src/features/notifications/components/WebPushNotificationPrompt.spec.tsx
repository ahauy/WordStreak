import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  WebPushNotificationPrompt,
  PUSH_STORAGE_KEY,
} from "./WebPushNotificationPrompt";

describe("WebPushNotificationPrompt (US-ECO-09)", () => {
  const originalNotification = window.Notification;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalNotification) {
      window.Notification = originalNotification;
    } else {
      // @ts-expect-error cleanup
      delete window.Notification;
    }
  });

  const setupMockNotification = (permission: NotificationPermission = "default") => {
    const requestPermissionMock = vi.fn().mockResolvedValue(permission);
    const mockNotificationClass = vi.fn();
    // @ts-expect-error mock assignment
    mockNotificationClass.permission = permission;
    // @ts-expect-error mock assignment
    mockNotificationClass.requestPermission = requestPermissionMock;

    // @ts-expect-error mock window
    window.Notification = mockNotificationClass;
    return { requestPermissionMock, mockNotificationClass };
  };

  it("TC-PUSH-01: does not render when Notification is unsupported in environment", () => {
    // @ts-expect-error delete Notification
    delete window.Notification;

    render(<WebPushNotificationPrompt />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("TC-PUSH-02: does not render when permission is already granted", () => {
    setupMockNotification("granted");

    render(<WebPushNotificationPrompt />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("TC-PUSH-03: does not render when previously dismissed by user in localStorage", () => {
    setupMockNotification("default");
    localStorage.setItem(PUSH_STORAGE_KEY, "dismissed");

    render(<WebPushNotificationPrompt />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("TC-PUSH-04: renders full prompt with streak flame messaging when permission is default", () => {
    setupMockNotification("default");

    render(<WebPushNotificationPrompt />);

    const region = screen.getByRole("region", { name: /Nhắc nhở bật thông báo đẩy/i });
    expect(region).toBeInTheDocument();
    expect(screen.getByText("Bảo vệ ngọn lửa tím")).toBeInTheDocument();
    expect(
      screen.getByText("Bật thông báo đẩy để không gián đoạn chuỗi học")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bật thông báo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Để sau" })).toBeInTheDocument();
  });

  it("TC-PUSH-05: dismisses prompt and saves preference when 'Để sau' is clicked", () => {
    setupMockNotification("default");
    const onDismissMock = vi.fn();

    render(<WebPushNotificationPrompt onDismiss={onDismissMock} />);

    const dismissBtn = screen.getByRole("button", { name: "Để sau" });
    fireEvent.click(dismissBtn);

    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(localStorage.getItem(PUSH_STORAGE_KEY)).toBe("dismissed");
    expect(onDismissMock).toHaveBeenCalled();
  });

  it("TC-PUSH-06: requests browser permission and handles granted state", async () => {
    const { requestPermissionMock } = setupMockNotification("default");
    requestPermissionMock.mockResolvedValue("granted");
    const onSubscribedMock = vi.fn();

    render(<WebPushNotificationPrompt onSubscribed={onSubscribedMock} />);

    const subscribeBtn = screen.getByRole("button", { name: "Bật thông báo" });
    fireEvent.click(subscribeBtn);

    expect(requestPermissionMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(localStorage.getItem(PUSH_STORAGE_KEY)).toBe("granted");
      expect(onSubscribedMock).toHaveBeenCalled();
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });
  });

  it("TC-PUSH-07: displays warning message when browser permission is denied", () => {
    setupMockNotification("denied");

    render(<WebPushNotificationPrompt />);

    expect(
      screen.getByText(/Thông báo đang bị chặn trong trình duyệt/i)
    ).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: "Bật thông báo" });
    expect(btn).toBeDisabled();
  });

  it("TC-PUSH-08: renders compact mode properly", () => {
    setupMockNotification("default");

    render(<WebPushNotificationPrompt compact={true} />);

    const region = screen.getByRole("region", { name: /Nhắc nhở bật thông báo đẩy/i });
    expect(region).toBeInTheDocument();
    expect(screen.getByText("Bật thông báo đẩy")).toBeInTheDocument();
    expect(screen.getByText("Nhắc nhở học & cảnh báo bảo vệ Streak")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bật" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bỏ qua" })).toBeInTheDocument();
  });
});
