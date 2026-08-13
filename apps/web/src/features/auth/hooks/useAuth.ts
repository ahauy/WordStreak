import { useState, useEffect, useCallback } from 'react';
import type { UserProfileDto, RegisterDto, LoginDto } from '@wordstreak/shared-types';
import { authApi } from '../services/authApi';

export function useAuth() {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const saveSession = useCallback((user: UserProfileDto, accessTok: string, refreshTok: string) => {
    setUser(user);
    setAccessToken(accessTok);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', refreshTok);
    }
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
    }
  }, []);

  const login = useCallback(async (dto: LoginDto) => {
    setError(null);
    try {
      const res = await authApi.login(dto);
      saveSession(res.user, res.tokens.accessToken, res.tokens.refreshToken);
      return res.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [saveSession]);

  const register = useCallback(async (dto: RegisterDto) => {
    setError(null);
    try {
      const res = await authApi.register(dto);
      saveSession(res.user, res.tokens.accessToken, res.tokens.refreshToken);
      return res.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [saveSession]);

  const logout = useCallback(async () => {
    if (accessToken) {
      try {
        await authApi.logout(accessToken);
      } catch (e) {
        // Ignore logout network errors
      }
    }
    clearSession();
  }, [accessToken, clearSession]);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== 'undefined') {
        const savedRefreshToken = localStorage.getItem('refreshToken');
        if (savedRefreshToken) {
          try {
            const res = await authApi.refreshToken(savedRefreshToken);
            saveSession(res.user, res.tokens.accessToken, res.tokens.refreshToken);
          } catch (e) {
            clearSession();
          }
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [saveSession, clearSession]);

  return {
    user,
    accessToken,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}
