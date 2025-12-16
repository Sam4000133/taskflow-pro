import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma';

describe('AppController', () => {
  let appController: AppController;

  const mockPrismaService = {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('should return API version string', () => {
      expect(appController.getHello()).toBe('TaskFlow Pro API v1.0.0');
    });
  });

  describe('getHealth', () => {
    it('should return health check result', async () => {
      const result = await appController.getHealth();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('checks');
      expect(result.checks).toHaveProperty('database');
      expect(result.checks).toHaveProperty('memory');
    });

    it('should return healthy status when database is up', async () => {
      const result = await appController.getHealth();

      expect(result.status).toBe('healthy');
      expect(result.checks.database.status).toBe('up');
    });
  });
});
