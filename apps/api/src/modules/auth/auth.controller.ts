import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type {
  ApiResponse,
  AuthResponse,
  AuthUser,
  JwtPayload,
  TokenRefreshResponse,
} from '@wordstreak/shared-types';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const REFRESH_COOKIE_NAME = 'refreshToken';

const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const userAgent =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent']
        : undefined;
    const ipAddress =
      typeof req.ip === 'string' ? req.ip : req.socket.remoteAddress;

    const { authResponse, refreshToken } = await this.authService.register(
      dto,
      userAgent,
      ipAddress,
    );

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getCookieOptions());
    return authResponse;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const userAgent =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent']
        : undefined;
    const ipAddress =
      typeof req.ip === 'string' ? req.ip : req.socket.remoteAddress;

    const { authResponse, refreshToken } = await this.authService.login(
      dto,
      userAgent,
      ipAddress,
    );

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getCookieOptions());
    return authResponse;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenRefreshResponse> {
    const cookies = req.cookies as
      Record<string, string | undefined> | undefined;
    const rawRefreshToken = cookies?.[REFRESH_COOKIE_NAME] || '';
    const userAgent =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent']
        : undefined;
    const ipAddress =
      typeof req.ip === 'string' ? req.ip : req.socket.remoteAddress;

    const { refreshResponse, newRefreshToken } = await this.authService.refresh(
      rawRefreshToken,
      userAgent,
      ipAddress,
    );

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, getCookieOptions());
    return refreshResponse;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<null>> {
    const cookies = req.cookies as
      Record<string, string | undefined> | undefined;
    const rawRefreshToken = cookies?.[REFRESH_COOKIE_NAME];
    const user = req.user;

    await this.authService.logout(user?.sessionId, rawRefreshToken);

    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(
    @CurrentUser('sub') userId: string,
  ): Promise<ApiResponse<AuthUser>> {
    const user = await this.authService.getMe(userId);
    return {
      success: true,
      data: user,
    };
  }
}
