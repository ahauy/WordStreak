import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PasswordUtil } from './utils/password.util';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findById: jest.Mock;
    findByEmail: jest.Mock;
    findByUsername: jest.Mock;
    findByEmailOrUsername: jest.Mock;
    create: jest.Mock;
  };
  let prismaService: {
    session: {
      create: jest.Mock;
      update: jest.Mock;
      findFirst: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let mailService: {
    sendWelcomeEmail: jest.Mock;
  };

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@wordstreak.app',
    username: 'streakuser',
    passwordHash: '',
    dailyGoal: 10,
    preferredLanguage: 'en',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    id: 'session-uuid-1',
    userId: 'user-uuid-1',
    hashedRefreshToken: 'hashed_token',
    userAgent: 'test-agent',
    ipAddress: '127.0.0.1',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    revokedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    mockUser.passwordHash = await PasswordUtil.hash('Password123');
  });

  beforeEach(async () => {
    usersService = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findByEmailOrUsername: jest.fn(),
      create: jest.fn(),
    };

    prismaService = {
      session: {
        create: jest.fn().mockResolvedValue(mockSession),
        update: jest.fn().mockResolvedValue(mockSession),
        findFirst: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    mailService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-access-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if email is already in use', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@wordstreak.app',
          username: 'newuser',
          password: 'Password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if username is already in use', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'unique@wordstreak.app',
          username: 'streakuser',
          password: 'Password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should register a new user successfully with preferredLanguage, send welcome email, and issue tokens', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'new@wordstreak.app',
        username: 'newuser',
        password: 'Password123',
        preferredLanguage: 'en',
      });

      expect(result.authResponse.user.email).toBe(mockUser.email);
      expect(result.authResponse.user.preferredLanguage).toBe('en');
      expect(result.authResponse.accessToken).toBe('mock-jwt-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          preferredLanguage: 'en',
        }),
      );
      expect(prismaService.session.create).toHaveBeenCalledTimes(1);
      expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.username,
      );
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found by email or username', async () => {
      usersService.findByEmailOrUsername.mockResolvedValue(null);

      await expect(
        service.login({
          identifier: 'unknown@wordstreak.app',
          password: 'Password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      usersService.findByEmailOrUsername.mockResolvedValue(mockUser);

      await expect(
        service.login({
          identifier: 'streakuser',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should successfully log in with username and return preferredLanguage', async () => {
      usersService.findByEmailOrUsername.mockResolvedValue(mockUser);

      const result = await service.login({
        identifier: 'streakuser',
        password: 'Password123',
      });

      expect(result.authResponse.user.id).toBe(mockUser.id);
      expect(result.authResponse.user.preferredLanguage).toBe('en');
      expect(result.authResponse.accessToken).toBe('mock-jwt-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(usersService.findByEmailOrUsername).toHaveBeenCalledWith(
        'streakuser',
      );
    });

    it('should successfully log in with email and issue tokens', async () => {
      usersService.findByEmailOrUsername.mockResolvedValue(mockUser);

      const result = await service.login({
        identifier: 'test@wordstreak.app',
        password: 'Password123',
      });

      expect(result.authResponse.user.id).toBe(mockUser.id);
      expect(result.authResponse.user.preferredLanguage).toBe('en');
      expect(result.authResponse.accessToken).toBe('mock-jwt-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(usersService.findByEmailOrUsername).toHaveBeenCalledWith(
        'test@wordstreak.app',
      );
    });
  });

  describe('getMe', () => {
    it('should return user profile including preferredLanguage', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.getMe('user-uuid-1');

      expect(result.id).toBe(mockUser.id);
      expect(result.preferredLanguage).toBe('en');
      expect(usersService.findById).toHaveBeenCalledWith('user-uuid-1');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.getMe('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should revoke session by sessionId', async () => {
      await service.logout('session-uuid-1');
      expect(prismaService.session.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'session-uuid-1', revokedAt: null },
        }),
      );
    });
  });

  describe('RegisterDto validation', () => {
    it('should validate valid preferredLanguage "vi"', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'learner@wordstreak.com',
        username: 'learner_1',
        password: 'Password123',
        preferredLanguage: 'vi',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate valid preferredLanguage "en"', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'learner@wordstreak.com',
        username: 'learner_1',
        password: 'Password123',
        preferredLanguage: 'en',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation for invalid preferredLanguage', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'learner@wordstreak.com',
        username: 'learner_1',
        password: 'Password123',
        preferredLanguage: 'fr',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const langError = errors.find((e) => e.property === 'preferredLanguage');
      expect(langError).toBeDefined();
      expect(langError?.constraints?.isIn).toContain('vi, en');
    });

    it('should pass validation when preferredLanguage is omitted', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'learner@wordstreak.com',
        username: 'learner_1',
        password: 'Password123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
