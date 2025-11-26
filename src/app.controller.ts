import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// IST offset: UTC+5:30
const getISTNow = (): Date => {
  const now = new Date();
  return new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
};

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
      timestamp: getISTNow().toISOString(),
      timezone: 'IST (UTC+5:30)',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }
}
