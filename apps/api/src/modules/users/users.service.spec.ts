import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordUtil } from '../auth/utils/password.util';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@wordstreak.com',
    username: 'streakmaster',
    passwordHash: 'argon2_hashed_secret',
    dailyGoal: 10,
    avatarUrl: 'preset:cosmos-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return sanitized user profile excluding passwordHash', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-uuid-1');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        dailyGoal: mockUser.dailyGoal,
        avatarUrl: mockUser.avatarUrl,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update dailyGoal and avatarUrl and return sanitized profile', async () => {
      const updatedUser = {
        ...mockUser,
        dailyGoal: 20,
        avatarUrl: 'preset:cosmos-2',
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-uuid-1', {
        dailyGoal: 20,
        avatarUrl: 'preset:cosmos-2',
      });

      expect(result.dailyGoal).toBe(20);
      expect(result.avatarUrl).toBe('preset:cosmos-2');
      expect(result).not.toHaveProperty('passwordHash');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: {
          dailyGoal: 20,
          avatarUrl: 'preset:cosmos-2',
        },
      });
    });
  });

  describe('changePassword', () => {
    it('should successfully change password and revoke other sessions', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(PasswordUtil, 'verify').mockResolvedValue(true);
      jest.spyOn(PasswordUtil, 'hash').mockResolvedValue('new_argon2_hash');
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        passwordHash: 'new_argon2_hash',
      });
      mockPrismaService.session.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.changePassword(
        'user-uuid-1',
        'session-123',
        {
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword123',
        },
      );

      expect(result).toEqual({ message: 'Password updated successfully' });
      expect(PasswordUtil.verify).toHaveBeenCalledWith(
        mockUser.passwordHash,
        'OldPassword123',
      );
      expect(PasswordUtil.hash).toHaveBeenCalledWith('NewPassword123');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { passwordHash: 'new_argon2_hash' },
      });
      expect(prisma.session.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-uuid-1',
          id: { not: 'session-123' },
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });

    it('should throw BadRequestException if current password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(PasswordUtil, 'verify').mockResolvedValue(false);

      await expect(
        service.changePassword('user-uuid-1', 'session-123', {
          currentPassword: 'WrongPassword123',
          newPassword: 'NewPassword123',
        }),
      ).rejects.toThrow(
        new BadRequestException('Current password is incorrect'),
      );

      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.session.updateMany).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if new password is same as current password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(PasswordUtil, 'verify').mockResolvedValue(true);

      await expect(
        service.changePassword('user-uuid-1', 'session-123', {
          currentPassword: 'SamePassword123',
          newPassword: 'SamePassword123',
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'New password must be different from current password',
        ),
      );

      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
