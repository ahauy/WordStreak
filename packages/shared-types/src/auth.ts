// Shared authentication types and DTOs

export type AppLanguage = "vi" | "en";

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  preferredLanguage?: AppLanguage;
}

export interface LoginDto {
  identifier: string; // Accepts email or username
  password: string;
  email?: string; // Optional backward-compatible alias
}

export interface JwtPayload {
  sub: string;
  email: string;
  sessionId: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  dailyGoal: number;
  avatarUrl?: string | null;
  preferredLanguage?: AppLanguage;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
}

export interface UserProfileResponse {
  user: AuthUser;
}

export interface UpdateProfileDto {
  dailyGoal?: number;
  avatarUrl?: string;
  preferredLanguage?: AppLanguage;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
