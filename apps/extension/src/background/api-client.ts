import { API_BASE_URL } from "../shared/constants";
import { extensionStorage } from "../shared/storage";
import type {
  QuickCaptureCardDto,
  QuickCaptureResponseDto,
  DeckResponse,
} from "@wordstreak/shared-types";

export class ExtensionApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await extensionStorage.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      let errorMessage = "Email/Username hoặc mật khẩu không chính xác";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // fallback to default
      }

      if (endpoint !== "/auth/login") {
        await extensionStorage.setToken(null);
        await extensionStorage.setUser(null);
        throw new Error(
          "UNAUTHORIZED: Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
        );
      }

      throw new Error(errorMessage);
    }

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  async quickCapture(
    dto: QuickCaptureCardDto,
  ): Promise<QuickCaptureResponseDto> {
    return this.request<QuickCaptureResponseDto>("/cards/quick-capture", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  }

  async getDecks(): Promise<DeckResponse[]> {
    return this.request<DeckResponse[]>("/decks", {
      method: "GET",
    });
  }

  async getMe(): Promise<{
    id: string;
    email: string;
    username: string;
    avatarUrl?: string | null;
  }> {
    return this.request<{
      id: string;
      email: string;
      username: string;
      avatarUrl?: string | null;
    }>("/users/me", {
      method: "GET",
    });
  }

  async login(credentials: { identifier: string; password: string }): Promise<{
    accessToken: string;
    user: {
      id: string;
      email: string;
      username: string;
      avatarUrl?: string | null;
    };
  }> {
    return this.request<{
      accessToken: string;
      user: {
        id: string;
        email: string;
        username: string;
        avatarUrl?: string | null;
      };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: credentials.identifier,
        password: credentials.password,
      }),
    });
  }
}

export const apiClient = new ExtensionApiClient();
