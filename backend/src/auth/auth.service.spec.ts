import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;

  // User with password (as stored in DB)
  const mockUserWithPassword = {
    id: 'test-uuid',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    name: 'Test User',
    role: 'USER',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // User without password (as returned by select)
  const mockUserWithoutPassword = {
    id: 'test-uuid',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    avatar: null,
    createdAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserWithPassword);

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return token on successful registration', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      // Prisma create with select returns user without password
      mockPrismaService.user.create.mockResolvedValue(mockUserWithoutPassword);

      const result = await authService.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'wrong@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user and token on successful login', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.user).not.toHaveProperty('password');
    });
  });
});
