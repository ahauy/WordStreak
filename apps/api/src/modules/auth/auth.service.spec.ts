import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mock-access-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-uuid-1',
        username: 'new_user',
        createdAt: new Date('2026-08-13T12:00:00.000Z'),
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register({ username: 'new_user', password: 'Password123' });

      expect(result.user.username).toBe('new_user');
      expect(result.tokens.accessToken).toBe('mock-access-token');
      expect(result.tokens.tokenType).toBe('Bearer');
      expect(result.tokens.expiresIn).toBe(900);
    });

    it('should throw ConflictException if username is already taken', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-id', username: 'new_user' });

      await expect(
        service.register({ username: 'new_user', password: 'Password123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should log in a user with correct credentials', async () => {
      const passwordHash = await bcrypt.hash('Password123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        username: 'streaker_99',
        passwordHash,
        createdAt: new Date('2026-08-13T12:00:00.000Z'),
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login({ username: 'streaker_99', password: 'Password123' });

      expect(result.user.username).toBe('streaker_99');
      expect(result.tokens.accessToken).toBe('mock-access-token');
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        username: 'streaker_99',
        passwordHash,
      });

      await expect(
        service.login({ username: 'streaker_99', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile by id', async () => {
      const createdAt = new Date('2026-08-13T12:00:00.000Z');
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        username: 'streaker_99',
        createdAt,
      });

      const result = await service.getProfile('user-uuid-1');
      expect(result).toEqual({
        id: 'user-uuid-1',
        username: 'streaker_99',
        createdAt: createdAt.toISOString(),
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully and delete consumed token', async () => {
      const rawToken = '7d9e8f7a-6b5c-4d3e-2f1a-0b9c8d7e6f5a';
      const tokenHash = require('crypto').createHash('sha256').update(rawToken).digest('hex');

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-db-id',
        userId: 'user-uuid-1',
        tokenHash,
        expiresAt: new Date(Date.now() + 100000),
        user: {
          id: 'user-uuid-1',
          username: 'streaker_99',
          createdAt: new Date('2026-08-13T12:00:00.000Z'),
        },
      });
      mockPrisma.refreshToken.update.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refreshToken({ refreshToken: rawToken });

      expect(result.tokens.accessToken).toBe('mock-access-token');
      expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-db-id' },
        data: { isRevoked: true },
      });
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      const rawToken = 'expired-token';
      const tokenHash = require('crypto').createHash('sha256').update(rawToken).digest('hex');

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-db-id',
        userId: 'user-uuid-1',
        tokenHash,
        isRevoked: false,
        expiresAt: new Date(Date.now() - 10000),
        user: { id: 'user-uuid-1', username: 'streaker_99', createdAt: new Date() },
      });

      await expect(service.refreshToken({ refreshToken: rawToken })).rejects.toThrow(UnauthorizedException);
    });

    it('should detect token reuse, revoke all user tokens, and throw UnauthorizedException', async () => {
      const rawToken = 'reused-token';
      const tokenHash = require('crypto').createHash('sha256').update(rawToken).digest('hex');

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-db-id-consumed',
        userId: 'user-uuid-1',
        tokenHash,
        isRevoked: true,
        expiresAt: new Date(Date.now() + 100000),
        user: { id: 'user-uuid-1', username: 'streaker_99', createdAt: new Date() },
      });
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 5 });

      await expect(service.refreshToken({ refreshToken: rawToken })).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
      });
    });
  });

  describe('logout', () => {
    it('should revoke all refresh tokens for the user on logout', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 });

      await service.logout('user-uuid-1');

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
      });
    });
  });
});
