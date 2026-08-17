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
import { AuthUser } from '@wordstreak/shared-types';

export interface CreateUserData {
  email: string;
  username: string;
  passwordHash: string;
  dailyGoal?: number;
  avatarUrl?: string;
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
}
