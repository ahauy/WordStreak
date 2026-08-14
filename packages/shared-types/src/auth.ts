// Shared authentication types and DTOs

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
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
  createdAt: string | Date;
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
