import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService, HealthCheckResult } from './app.service';
import { Public } from './auth';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Welcome message' })
  @ApiResponse({ status: 200, description: 'Returns welcome message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description:
      'Returns health status with database connectivity and memory usage',
  })
  getHealth(): Promise<HealthCheckResult> {
    return this.appService.getHealth();
  }
}
