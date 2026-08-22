import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../../locales/i18n";
import { RegisterForm } from "../RegisterForm";
import { useAuthStore } from "../../../../store/useAuthStore";

vi.mock("../../../../store/useAuthStore", () => ({
  useAuthStore: vi.fn(),
}));

function renderRegisterForm(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

describe("RegisterForm i18n Language Carryover (US-I18N-03 / REQ-I18N-SYNC-003)", () => {
  const mockRegister = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });
  });

  it("submits registration with preferredLanguage = 'en' when active locale is English", async () => {
    await i18n.changeLanguage("en");
    mockRegister.mockResolvedValueOnce(undefined);

    renderRegisterForm(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "english_user@wordstreak.io" },
    });
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "english_user" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: "StrongPass123!" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "StrongPass123!" },
    });

    const submitButton = screen.getByRole("button", {
      name: /Start Learning Free/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "english_user@wordstreak.io",
        username: "english_user",
        password: "StrongPass123!",
        preferredLanguage: "en",
      });
    });
  });

  it("submits registration with preferredLanguage = 'vi' when active locale is Vietnamese", async () => {
    await i18n.changeLanguage("vi");
    mockRegister.mockResolvedValueOnce(undefined);

    renderRegisterForm(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/Địa chỉ Email/i), {
      target: { value: "vietnamese_user@wordstreak.io" },
    });
    fireEvent.change(screen.getByLabelText(/Tên người dùng/i), {
      target: { value: "vietnamese_user" },
    });
    fireEvent.change(screen.getByLabelText(/^Mật khẩu/i), {
      target: { value: "StrongPass123!" },
    });
    fireEvent.change(screen.getByLabelText(/Xác nhận mật khẩu/i), {
      target: { value: "StrongPass123!" },
    });

    const submitButton = screen.getByRole("button", {
      name: /Bắt đầu học miễn phí/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "vietnamese_user@wordstreak.io",
        username: "vietnamese_user",
        password: "StrongPass123!",
        preferredLanguage: "vi",
      });
    });
  });
});
