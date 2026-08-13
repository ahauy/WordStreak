import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import type { RegisterDto, LoginDto, RefreshTokenDto, AuthResponseDto } from '@wordstreak/shared-types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existingUser) {
      throw new ConflictException(`Username '${dto.username}' is already taken`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        passwordHash,
      },
    });

    return this.generateAuthResponse(user.id, user.username, user.createdAt);
  }

  private async generateAuthResponse(userId: string, username: string, createdAt: Date): Promise<AuthResponseDto> {
    const payload = { sub: userId, username };
    const accessToken = this.jwtService.sign(payload);
    
    const refreshTokenRaw = crypto.randomUUID();
    const tokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return {
      user: {
        id: userId,
        username,
        createdAt: createdAt.toISOString(),
      },
      tokens: {
        accessToken,
        refreshToken: refreshTokenRaw,
        tokenType: 'Bearer',
        expiresIn: 900,
      },
    };
  }
}
