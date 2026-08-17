import { apiClient } from "../../../common/api/axios";
import type {
  AuthUser,
  UpdateProfileDto,
  ChangePasswordDto,
} from "@wordstreak/shared-types";

export const userService = {
  async getProfile(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>("/users/profile");
    return response.data;
  },

  async updateProfile(dto: UpdateProfileDto): Promise<AuthUser> {
    const response = await apiClient.patch<AuthUser>("/users/profile", dto);
    return response.data;
  },

  async changePassword(dto: ChangePasswordDto): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/users/change-password",
      dto,
    );
    return response.data;
  },
};
