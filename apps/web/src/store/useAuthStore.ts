import { create } from "zustand";
import axios from "axios";
import type { AuthUser, LoginDto, RegisterDto } from "@wordstreak/shared-types";
import { authApi } from "../features/auth/services/auth.api";
import { setAccessTokenHeader, setAuthCallbacks } from "../common/api/axios";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  clearError: () => void;
}

const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const responseData = err.response?.data as
      { message?: string | string[]; error?: string } | undefined;
    if (responseData?.message) {
      return Array.isArray(responseData.message)
        ? responseData.message.join(", ")
        : responseData.message;
    }
    if (responseData?.error) {
      return responseData.error;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
};

export const useAuthStore = create<AuthState>((set, get) => {
  // Wire up Axios interceptor callbacks to Zustand state
  setAuthCallbacks(
    (newToken: string) => {
      set({ accessToken: newToken, isAuthenticated: true });
    },
    () => {
      get().clearAuth();
    },
  );

  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,

    setAccessToken: (token: string) => {
      setAccessTokenHeader(token);
      set({ accessToken: token, isAuthenticated: true });
    },

    clearAuth: () => {
      setAccessTokenHeader(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    },

    clearError: () => set({ error: null }),

    initializeAuth: async () => {
      set({ isLoading: true });
      try {
        const refreshResult = await authApi.refresh();
        setAccessTokenHeader(refreshResult.accessToken);
        const user = await authApi.getMe();
        set({
          user,
          accessToken: refreshResult.accessToken,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      } catch {
        get().clearAuth();
        set({ isInitialized: true, isLoading: false });
      }
    },

    login: async (dto: LoginDto) => {
      set({ isLoading: true, error: null });
      try {
        const result = await authApi.login(dto);
        setAccessTokenHeader(result.accessToken);
        set({
          user: result.user,
          accessToken: result.accessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err: unknown) {
        const message = extractErrorMessage(
          err,
          "Failed to log in. Please check your credentials.",
        );
        set({
          isLoading: false,
          error: message,
        });
        throw err;
      }
    },

    register: async (dto: RegisterDto) => {
      set({ isLoading: true, error: null });
      try {
        const result = await authApi.register(dto);
        setAccessTokenHeader(result.accessToken);
        set({
          user: result.user,
          accessToken: result.accessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err: unknown) {
        const message = extractErrorMessage(
          err,
          "Registration failed. Please try again.",
        );
        set({
          isLoading: false,
          error: message,
        });
        throw err;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        await authApi.logout();
      } catch {
        // Ignore logout network errors and clear local state
      } finally {
        get().clearAuth();
        set({ isInitialized: true });
      }
    },
  };
});
