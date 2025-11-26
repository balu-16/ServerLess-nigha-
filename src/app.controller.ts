import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      timezone: 'IST (Asia/Kolkata)',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }
}
