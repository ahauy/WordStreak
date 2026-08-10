import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { ApiResponse } from '@wordstreak/shared-types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): ApiResponse<string> {
    return this.appService.getHello();
  }
}
