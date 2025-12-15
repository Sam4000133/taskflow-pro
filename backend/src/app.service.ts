import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  version: string;
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  environment: string;
}

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'TaskFlow Pro API v1.0.0';
  }

  async getHealth(): Promise<HealthCheckResult> {
    const dbCheck = await this.checkDatabase();
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;

    const isHealthy = dbCheck.status === 'up';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks: {
        database: dbCheck,
        memory: {
          used: Math.round(usedMemory / 1024 / 1024),
          total: Math.round(totalMemory / 1024 / 1024),
          percentage: Math.round((usedMemory / totalMemory) * 100),
        },
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }

  private async checkDatabase(): Promise<{
    status: 'up' | 'down';
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
