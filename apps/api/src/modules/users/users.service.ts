import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { PasswordUtil } from '../auth/utils/password.util';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  AuthUser,
  AppLanguage,
  OnboardingDto,
  OnboardingResponse,
} from '@wordstreak/shared-types';

export interface CreateUserData {
  email: string;
  username: string;
  passwordHash: string;
  dailyGoal?: number;
  avatarUrl?: string;
  preferredLanguage?: AppLanguage;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToProfile(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      dailyGoal: user.dailyGoal,
      avatarUrl: user.avatarUrl,
      preferredLanguage: (user.preferredLanguage as AppLanguage) ?? 'vi',
      learningGoal: user.learningGoal,
      startingLevel: user.startingLevel,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username: username.trim() },
    });
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const cleanIdentifier = identifier.trim();
    const lowerIdentifier = cleanIdentifier.toLowerCase();

    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: lowerIdentifier }, { username: cleanIdentifier }],
      },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        username: data.username.trim(),
        passwordHash: data.passwordHash,
        dailyGoal: data.dailyGoal ?? 10,
        avatarUrl: data.avatarUrl,
        preferredLanguage: data.preferredLanguage ?? 'vi',
      },
    });
  }

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.mapToProfile(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<AuthUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.dailyGoal !== undefined && { dailyGoal: dto.dailyGoal }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.preferredLanguage !== undefined && {
          preferredLanguage: dto.preferredLanguage,
        }),
      },
    });
    return this.mapToProfile(user);
  }

  async changePassword(
    userId: string,
    currentSessionId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentValid = await PasswordUtil.verify(
      user.passwordHash,
      dto.currentPassword,
    );
    if (!isCurrentValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const newPasswordHash = await PasswordUtil.hash(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    if (currentSessionId) {
      await this.prisma.session.updateMany({
        where: {
          userId,
          id: { not: currentSessionId },
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    return { message: 'Password updated successfully' };
  }

  async completeOnboarding(
    userId: string,
    dto: OnboardingDto,
  ): Promise<OnboardingResponse> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Determine target pathCode for initial deck recommendation
    let targetPath = 'CORE';
    if (dto.startingLevel === 'ZERO') {
      targetPath = 'FOUNDATION';
    } else if (dto.learningGoal === 'TOEIC') {
      targetPath = 'TOEIC';
    } else if (dto.learningGoal === 'IELTS') {
      targetPath = 'ACADEMIC';
    }

    let recommendedDeck = await this.prisma.officialDeck.findFirst({
      where: { pathCode: targetPath },
      orderBy: { order: 'asc' },
    });

    if (!recommendedDeck && targetPath !== 'CORE') {
      recommendedDeck = await this.prisma.officialDeck.findFirst({
        where: { pathCode: 'CORE' },
        orderBy: { order: 'asc' },
      });
    }

    let enrolledDeckId: string | undefined;
    let enrolledDeckTitle: string | undefined;
    if (recommendedDeck) {
      await this.prisma.userDeckEnrollment.upsert({
        where: {
          userId_deckId: {
            userId,
            deckId: recommendedDeck.id,
          },
        },
        create: {
          userId,
          deckId: recommendedDeck.id,
        },
        update: {},
      });
      enrolledDeckId = recommendedDeck.id;
      enrolledDeckTitle = recommendedDeck.title;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        learningGoal: dto.learningGoal,
        startingLevel: dto.startingLevel,
        onboardingCompleted: true,
        ...(dto.dailyGoal ? { dailyGoal: dto.dailyGoal } : {}),
      },
    });

    return {
      success: true,
      enrolledDeckId,
      enrolledDeckTitle,
      user: this.mapToProfile(updatedUser),
    };
  }
}
