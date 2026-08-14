import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PasswordUtil } from './utils/password.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthResponse,
  AuthUser,
  JwtPayload,
  TokenRefreshResponse,
} from '@wordstreak/shared-types';

const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private mapToAuthUser(user: {
    id: string;
    email: string;
    username: string;
    dailyGoal: number;
    createdAt: Date;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      dailyGoal: user.dailyGoal,
      createdAt: user.createdAt,
    };
  }

  private generateRefreshTokenString(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  private generateTokens(
    user: { id: string; email: string },
    sessionId: string,
  ): { accessToken: string; refreshToken: string } {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      sessionId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
      secret:
        process.env.JWT_SECRET ||
        'wordstreak-jwt-access-secret-default-key-32chars',
    });

    const refreshToken = this.generateRefreshTokenString();

    return { accessToken, refreshToken };
  }

  async register(
    dto: RegisterDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ authResponse: AuthResponse; refreshToken: string }> {
    const existingByEmail = await this.usersService.findByEmail(dto.email);
    if (existingByEmail) {
      throw new ConflictException('Email already in use');
    }

    const existingByUsername = await this.usersService.findByUsername(
      dto.username,
    );
    if (existingByUsername) {
      throw new ConflictException('Username already in use');
    }

    const passwordHash = await PasswordUtil.hash(dto.password);
    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      passwordHash,
    });

    // Send welcome email asynchronously without blocking registration response
    void this.mailService.sendWelcomeEmail(user.email, user.username);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    const tempToken = this.generateRefreshTokenString();
    const hashedRefreshToken = this.hashToken(tempToken);

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        hashedRefreshToken,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    const tokens = this.generateTokens(user, session.id);
    await this.prisma.session.update({
      where: { id: session.id },
      data: { hashedRefreshToken: this.hashToken(tokens.refreshToken) },
    });

    return {
      authResponse: {
        user: this.mapToAuthUser(user),
        accessToken: tokens.accessToken,
      },
      refreshToken: tokens.refreshToken,
    };
  }

  async login(
    dto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ authResponse: AuthResponse; refreshToken: string }> {
    const identifier = dto.identifier || dto.email;
    if (!identifier) {
      throw new UnauthorizedException('Email or username is required');
    }

    const user = await this.usersService.findByEmailOrUsername(identifier);
    if (!user) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    const isPasswordValid = await PasswordUtil.verify(
      user.passwordHash,
      dto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    const tempToken = this.generateRefreshTokenString();
    const hashedRefreshToken = this.hashToken(tempToken);

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        hashedRefreshToken,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    const tokens = this.generateTokens(user, session.id);
    await this.prisma.session.update({
      where: { id: session.id },
      data: { hashedRefreshToken: this.hashToken(tokens.refreshToken) },
    });

    return {
      authResponse: {
        user: this.mapToAuthUser(user),
        accessToken: tokens.accessToken,
      },
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(
    rawRefreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{
    refreshResponse: TokenRefreshResponse;
    newRefreshToken: string;
  }> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const hashedInput = this.hashToken(rawRefreshToken);
    const session = await this.prisma.session.findFirst({
      where: {
        hashedRefreshToken: hashedInput,
        revokedAt: null,
      },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    const user = session.user;
    const tokens = this.generateTokens(user, session.id);

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        hashedRefreshToken: this.hashToken(tokens.refreshToken),
        userAgent: userAgent || session.userAgent,
        ipAddress: ipAddress || session.ipAddress,
        expiresAt: newExpiresAt,
      },
    });

    return {
      refreshResponse: {
        accessToken: tokens.accessToken,
      },
      newRefreshToken: tokens.refreshToken,
    };
  }

  async logout(sessionId?: string, rawRefreshToken?: string): Promise<void> {
    if (sessionId) {
      await this.prisma.session.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return;
    }

    if (rawRefreshToken) {
      const hashed = this.hashToken(rawRefreshToken);
      await this.prisma.session.updateMany({
        where: { hashedRefreshToken: hashed, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.mapToAuthUser(user);
  }
}
