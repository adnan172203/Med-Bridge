import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { RefreshTokenIdsStorage } from './refresh-token-storage/refresh-token-ids.storage';
import { Response } from 'express';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mocked_token'),
};

enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            secret: 'test_secret',
            audience: 'test_audience',
            issuer: 'test_issuer',
            accessTokenTtl: 3600,
            refreshTokenTtl: 86400,
          },
        },
        {
          provide: RefreshTokenIdsStorage,
          useValue: {
            insert: jest.fn(),
            validate: jest.fn(),
            invalidate: jest.fn(),
          },
        },
      ],
    }).compile();

    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => {
      return 'hashedPassword';
    });
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => {
      return true;
    });

    authService = module.get<AuthService>(AuthService);
    // authService['jwtService'] = mockJwtService;
    // userRepository = module.get(getRepositoryToken(User));
  });
  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should check signup method', () => {
    expect(authService.signUp).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user when the email is not in use', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const signupParams = {
        name: 'Test User',
        email: 'test1@example.com',
        password: 'password123',
        address: 'Test Address',
        role: Role.USER,
        phoneNumber: '1234567890',
      };

      mockRepository.save.mockResolvedValue({
        id: 1,
        ...signupParams,
      });

      const result = await authService.signUp(signupParams);

      expect(result).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should hash the password before storing it in the database', () => {
      const signupParams = {
        name: 'Test User',
        email: 'test1@example.com',
        password: 'password123',
      };

      expect(bcrypt.hash).toHaveBeenCalledWith(signupParams.password, 10);
    });

    it('should throw a ConflictException when the email is already in use', async () => {
      // Mock the PrismaService user.findUnique to return an existing user.
      mockRepository.findOne.mockResolvedValue(null);

      const signupParams = {
        name: 'Test User',
        email: 'test1@example.com',
        password: 'password123',
        address: 'Test Address',
        role: Role.USER,
        phoneNumber: '1234567890',
      };

      try {
        await authService.signUp(signupParams);
      } catch (error) {
        expect(error).toBe('Username or email already exists');
      }
    });
  });

  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as Response<any, Record<string, any>>;

  describe('signIn', () => {
    it('should throw an exception when user is not found', async () => {
      const signinParams = {
        email: 'test1@example.com',
        password: 'password123',
      };
      mockRepository.findOne.mockResolvedValue(null);
      await expect(
        authService.signIn(mockResponse, signinParams)
      ).rejects.toThrow(new HttpException('Invalid credentials', 400));
    });

    it('should throw an exception when user is not found', async () => {
      const signinParams = {
        email: 'test1@example.com',
        password: 'password123',
      };
      mockRepository.findOne.mockResolvedValue(null);
      await expect(
        authService.signIn(mockResponse, signinParams)
      ).rejects.toThrow(new HttpException('Invalid credentials', 400));
    });
    it('should throw an exception when password is incorrect', async () => {
      const signinParams = {
        email: 'test1@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      mockRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        authService.signIn(mockResponse, signinParams)
      ).rejects.toThrow(new HttpException('Invalid credentials', 400));
    });
    it('should login user and return the token', async () => {
      const signinParams = {
        email: 'test1@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: 1,
        email: signinParams.email,
        password: 'hashedPassword',
        role: 'user',
      };
      mockRepository.findOne.mockResolvedValue(mockUser);
      const result = await authService.signIn(mockResponse, signinParams);
      expect(result).toBeDefined();
      // Additional checks for JWT token could be done here
    });
  });
});
