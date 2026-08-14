import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

export interface CreateUserData {
  email: string;
  username: string;
  passwordHash: string;
  dailyGoal?: number;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
      },
    });
  }
}
