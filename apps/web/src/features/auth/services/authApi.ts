import type { RegisterDto, LoginDto, AuthResponseDto, UserProfileDto } from '@wordstreak/shared-types';

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:3000';

export const authApi = {
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    return json.data;
  },

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Invalid credentials');
    return json.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Token refresh failed');
    return json.data;
  },

  async logout(accessToken: string): Promise<void> {
    await fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async getMe(accessToken: string): Promise<UserProfileDto> {
    const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load profile');
    return json.data;
  },
};
