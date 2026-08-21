import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import type { TokenRefreshResponse } from "@wordstreak/shared-types";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_BASE_URL = rawApiUrl.endsWith("/api")
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/+$/, "")}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Callback to notify Zustand store when token is refreshed or refresh fails
let onTokenRefreshedCallback: ((token: string) => void) | null = null;
let onAuthFailedCallback: (() => void) | null = null;

export const setAuthCallbacks = (
  onRefreshed: (token: string) => void,
  onFailed: () => void,
) => {
  onTokenRefreshedCallback = onRefreshed;
  onAuthFailedCallback = onFailed;
};

export const setAccessTokenHeader = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh");

    if (originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post<TokenRefreshResponse>(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newAccessToken = response.data.accessToken;
      setAccessTokenHeader(newAccessToken);

      if (onTokenRefreshedCallback) {
        onTokenRefreshedCallback(newAccessToken);
      }

      processQueue(null, newAccessToken);
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      setAccessTokenHeader(null);

      if (onAuthFailedCallback) {
        onAuthFailedCallback();
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
