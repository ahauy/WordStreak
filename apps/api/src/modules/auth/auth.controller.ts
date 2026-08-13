import { Controller, Post, Get, Body, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { AuthResponseDto, UserProfileDto } from '@wordstreak/shared-types';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<{ success: true; data: AuthResponseDto }> {
    const data = await this.authService.register(dto);
    return { success: true, data };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<{ success: true; data: AuthResponseDto }> {
    const data = await this.authService.login(dto);
    return { success: true, data };
  }

  @Get('me')
  async getProfile(@Request() req: { user: { id: string } }): Promise<{ success: true; data: UserProfileDto }> {
    const data = await this.authService.getProfile(req.user.id);
    return { success: true, data };
  }
}
