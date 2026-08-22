import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordUtil } from '../auth/utils/password.util';
import { UpdateProfileDto } from './dto/update-profile.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@wordstreak.com',
    username: 'streakmaster',
    passwordHash: 'argon2_hashed_secret',
    dailyGoal: 10,
    avatarUrl: 'preset:cosmos-1',
    preferredLanguage: 'vi',
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
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return sanitized user profile with preferredLanguage excluding passwordHash', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-uuid-1');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        dailyGoal: mockUser.dailyGoal,
        avatarUrl: mockUser.avatarUrl,
        preferredLanguage: 'vi',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
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
    it('should update dailyGoal, avatarUrl, and preferredLanguage and return sanitized profile', async () => {
      const updatedUser = {
        ...mockUser,
        dailyGoal: 20,
        avatarUrl: 'preset:cosmos-2',
        preferredLanguage: 'en',
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-uuid-1', {
        dailyGoal: 20,
        avatarUrl: 'preset:cosmos-2',
        preferredLanguage: 'en',
      });

      expect(result.dailyGoal).toBe(20);
      expect(result.avatarUrl).toBe('preset:cosmos-2');
      expect(result.preferredLanguage).toBe('en');
      expect(result).not.toHaveProperty('passwordHash');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: {
          dailyGoal: 20,
          avatarUrl: 'preset:cosmos-2',
          preferredLanguage: 'en',
        },
      });
    });

    it('should allow updating only preferredLanguage', async () => {
      const updatedUser = {
        ...mockUser,
        preferredLanguage: 'en',
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-uuid-1', {
        preferredLanguage: 'en',
      });

      expect(result.preferredLanguage).toBe('en');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: {
          preferredLanguage: 'en',
        },
      });
    });
  });

  describe('create', () => {
    it('should create user with explicit preferredLanguage', async () => {
      const newUser = {
        ...mockUser,
        preferredLanguage: 'en',
      };
      mockPrismaService.user.create.mockResolvedValue(newUser);

      const result = await service.create({
        email: 'test@wordstreak.com',
        username: 'streakmaster',
        passwordHash: 'hash',
        preferredLanguage: 'en',
      });

      expect(result.preferredLanguage).toBe('en');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@wordstreak.com',
          username: 'streakmaster',
          passwordHash: 'hash',
          dailyGoal: 10,
          avatarUrl: undefined,
          preferredLanguage: 'en',
        },
      });
    });

    it('should default preferredLanguage to "vi" when omitted', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create({
        email: 'test@wordstreak.com',
        username: 'streakmaster',
        passwordHash: 'hash',
      });

      expect(result.preferredLanguage).toBe('vi');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@wordstreak.com',
          username: 'streakmaster',
          passwordHash: 'hash',
          dailyGoal: 10,
          avatarUrl: undefined,
          preferredLanguage: 'vi',
        },
      });
    });
  });

  describe('changePassword', () => {
    it('should successfully change password and revoke other sessions', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const verifySpy = jest
        .spyOn(PasswordUtil, 'verify')
        .mockResolvedValue(true);
      const hashSpy = jest
        .spyOn(PasswordUtil, 'hash')
        .mockResolvedValue('new_argon2_hash');
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
      expect(verifySpy).toHaveBeenCalledWith(
        mockUser.passwordHash,
        'OldPassword123',
      );
      expect(hashSpy).toHaveBeenCalledWith('NewPassword123');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { passwordHash: 'new_argon2_hash' },
      });
      expect(mockPrismaService.session.updateMany).toHaveBeenCalledTimes(1);
      const calls = mockPrismaService.session.updateMany.mock
        .calls as unknown as Array<
        [{ where: Record<string, unknown>; data: { revokedAt: Date } }]
      >;
      const callData = calls[0][0];
      expect(callData.where).toEqual({
        userId: 'user-uuid-1',
        id: { not: 'session-123' },
        revokedAt: null,
      });
      expect(callData.data.revokedAt).toBeInstanceOf(Date);
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

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      expect(mockPrismaService.session.updateMany).not.toHaveBeenCalled();
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

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('UpdateProfileDto validation', () => {
    it('should validate valid preferredLanguage "vi"', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        preferredLanguage: 'vi',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate valid preferredLanguage "en"', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        preferredLanguage: 'en',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for invalid preferredLanguage "fr"', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        preferredLanguage: 'fr',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isIn');
      expect(errors[0].constraints?.isIn).toContain('vi, en');
    });

    it('should pass validation when preferredLanguage is undefined', async () => {
      const dto = plainToInstance(UpdateProfileDto, {
        dailyGoal: 15,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
