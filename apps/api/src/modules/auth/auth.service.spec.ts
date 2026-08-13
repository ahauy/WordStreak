import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuthService - Register', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
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
