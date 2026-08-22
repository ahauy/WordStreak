import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "../useAuthStore";
import { authApi } from "../../features/auth/services/auth.api";
import i18n from "../../locales/i18n";
import { STORAGE_KEY } from "../../locales/constants";
import type { AuthUser } from "@wordstreak/shared-types";

vi.mock("../../features/auth/services/auth.api", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}));

vi.mock("../../common/api/axios", () => ({
  setAccessTokenHeader: vi.fn(),
  setAuthCallbacks: vi.fn(),
}));

describe("useAuthStore i18n Hydration (US-I18N-03 / REQ-I18N-SYNC-005)", () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage("vi");
    useAuthStore.getState().clearAuth();
    vi.clearAllMocks();
  });

  it("hydrates localStorage and i18n when initializeAuth loads user with preferredLanguage = 'en'", async () => {
    const mockUser: AuthUser = {
      id: "u-123",
      email: "learner@wordstreak.io",
      username: "learner",
      dailyGoal: 10,
      preferredLanguage: "en",
      createdAt: new Date().toISOString(),
    };

    vi.mocked(authApi.refresh).mockResolvedValueOnce({
      accessToken: "token-abc",
    });
    vi.mocked(authApi.getMe).mockResolvedValueOnce(mockUser);

    await useAuthStore.getState().initializeAuth();

    expect(useAuthStore.getState().user?.preferredLanguage).toBe("en");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("en");
    expect(i18n.language).toBe("en");
  });

  it("hydrates localStorage and i18n when initializeAuth loads user with preferredLanguage = 'vi'", async () => {
    await i18n.changeLanguage("en");
    localStorage.setItem(STORAGE_KEY, "en");

    const mockUser: AuthUser = {
      id: "u-456",
      email: "learner_vi@wordstreak.io",
      username: "learner_vi",
      dailyGoal: 15,
      preferredLanguage: "vi",
      createdAt: new Date().toISOString(),
    };

    vi.mocked(authApi.refresh).mockResolvedValueOnce({
      accessToken: "token-xyz",
    });
    vi.mocked(authApi.getMe).mockResolvedValueOnce(mockUser);

    await useAuthStore.getState().initializeAuth();

    expect(useAuthStore.getState().user?.preferredLanguage).toBe("vi");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("vi");
    expect(i18n.language).toBe("vi");
  });

  it("hydrates localStorage and i18n when login returns user with preferredLanguage = 'en'", async () => {
    const mockUser: AuthUser = {
      id: "u-789",
      email: "login_user@wordstreak.io",
      username: "login_user",
      dailyGoal: 20,
      preferredLanguage: "en",
      createdAt: new Date().toISOString(),
    };

    vi.mocked(authApi.login).mockResolvedValueOnce({
      user: mockUser,
      accessToken: "access-token-login",
    });

    await useAuthStore.getState().login({
      identifier: "login_user@wordstreak.io",
      password: "Password123!",
    });

    expect(useAuthStore.getState().user?.preferredLanguage).toBe("en");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("en");
    expect(i18n.language).toBe("en");
  });

  it("hydrates localStorage and i18n when register returns user with preferredLanguage = 'en'", async () => {
    const mockUser: AuthUser = {
      id: "u-reg",
      email: "reg_user@wordstreak.io",
      username: "reg_user",
      dailyGoal: 10,
      preferredLanguage: "en",
      createdAt: new Date().toISOString(),
    };

    vi.mocked(authApi.register).mockResolvedValueOnce({
      user: mockUser,
      accessToken: "access-token-reg",
    });

    await useAuthStore.getState().register({
      email: "reg_user@wordstreak.io",
      username: "reg_user",
      password: "Password123!",
      preferredLanguage: "en",
    });

    expect(useAuthStore.getState().user?.preferredLanguage).toBe("en");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("en");
    expect(i18n.language).toBe("en");
  });

  it("syncs localStorage and i18n when updateUser is called with preferredLanguage", async () => {
    const initialUser: AuthUser = {
      id: "u-upd",
      email: "update_user@wordstreak.io",
      username: "update_user",
      dailyGoal: 10,
      preferredLanguage: "vi",
      createdAt: new Date().toISOString(),
    };

    useAuthStore.setState({ user: initialUser, isAuthenticated: true });

    useAuthStore.getState().updateUser({ preferredLanguage: "en" });

    expect(useAuthStore.getState().user?.preferredLanguage).toBe("en");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("en");
    expect(i18n.language).toBe("en");
  });

  it("does not overwrite localStorage if user preferredLanguage is undefined", async () => {
    localStorage.setItem(STORAGE_KEY, "vi");
    await i18n.changeLanguage("vi");

    const mockUser: AuthUser = {
      id: "u-undef",
      email: "undef@wordstreak.io",
      username: "undef_user",
      dailyGoal: 10,
      createdAt: new Date().toISOString(),
    };

    vi.mocked(authApi.login).mockResolvedValueOnce({
      user: mockUser,
      accessToken: "token-undef",
    });

    await useAuthStore.getState().login({
      identifier: "undef@wordstreak.io",
      password: "Password123!",
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBe("vi");
    expect(i18n.language).toBe("vi");
  });
});
