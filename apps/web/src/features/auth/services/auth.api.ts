import { apiClient } from "../../../common/api/axios";
import type {
  ApiResponse,
  AuthResponse,
  AuthUser,
  LoginDto,
  RegisterDto,
  TokenRefreshResponse,
} from "@wordstreak/shared-types";

export const authApi = {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", dto);
    return response.data;
  },

  async login(dto: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", dto);
    return response.data;
  },

  async refresh(): Promise<TokenRefreshResponse> {
    const response =
      await apiClient.post<TokenRefreshResponse>("/auth/refresh");
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async getMe(): Promise<AuthUser> {
    const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
    if (!response.data.data) {
      throw new Error(response.data.error || "Failed to fetch user profile");
    }
    return response.data.data;
  },
};
