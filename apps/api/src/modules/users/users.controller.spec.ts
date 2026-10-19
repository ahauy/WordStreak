import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtPayload } from '@wordstreak/shared-types';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUserPayload: JwtPayload = {
    sub: 'user-uuid-1',
    email: 'test@wordstreak.com',
    sessionId: 'session-123',
  };

  const mockProfile = {
    id: 'user-uuid-1',
    email: 'test@wordstreak.com',
    username: 'streakmaster',
    dailyGoal: 10,
    avatarUrl: 'preset:cosmos-1',
    preferredLanguage: 'vi' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    completeOnboarding: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('GET /profile', () => {
    it('should return user profile from service', async () => {
      mockUsersService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(mockUserPayload);

      expect(result).toEqual(mockProfile);
      expect(mockUsersService.getProfile).toHaveBeenCalledWith('user-uuid-1');
    });
  });

  describe('PATCH /profile', () => {
    it('should update user profile via service', async () => {
      const updatedProfile = {
        ...mockProfile,
        dailyGoal: 20,
        preferredLanguage: 'en' as const,
      };
      mockUsersService.updateProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateProfile(mockUserPayload, {
        dailyGoal: 20,
        preferredLanguage: 'en',
      });

      expect(result).toEqual(updatedProfile);
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(
        'user-uuid-1',
        {
          dailyGoal: 20,
          preferredLanguage: 'en',
        },
      );
    });
  });

  describe('PATCH /onboarding', () => {
    it('should complete onboarding via service', async () => {
      const mockOnboardingResponse = {
        success: true,
        enrolledDeckId: 'deck-123',
        enrolledDeckTitle: 'TSL Office',
        user: {
          ...mockProfile,
          learningGoal: 'TOEIC',
          startingLevel: 'BEGINNER',
          onboardingCompleted: true,
        },
      };
      mockUsersService.completeOnboarding.mockResolvedValue(
        mockOnboardingResponse,
      );

      const result = await controller.completeOnboarding(mockUserPayload, {
        learningGoal: 'TOEIC',
        startingLevel: 'BEGINNER',
        dailyGoal: 10,
      });

      expect(result).toEqual(mockOnboardingResponse);
      expect(mockUsersService.completeOnboarding).toHaveBeenCalledWith(
        'user-uuid-1',
        {
          learningGoal: 'TOEIC',
          startingLevel: 'BEGINNER',
          dailyGoal: 10,
        },
      );
    });
  });

  describe('POST /change-password', () => {
    it('should change password via service with user ID and session ID', async () => {
      mockUsersService.changePassword.mockResolvedValue({
        message: 'Password updated successfully',
      });

      const result = await controller.changePassword(mockUserPayload, {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword123',
      });

      expect(result).toEqual({ message: 'Password updated successfully' });
      expect(mockUsersService.changePassword).toHaveBeenCalledWith(
        'user-uuid-1',
        'session-123',
        {
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword123',
        },
      );
    });
  });
});
