// Tests unitaires pour AuthController
// Couvre : register, login, refresh, logout, getProfile

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { UserRole } from '../../src/users/entities/user.entity';
import { JwtPayload } from '../../src/auth/strategies/jwt.strategy';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: mockUser,
  };

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refreshToken: jest.fn(),
      getCurrentUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      username: 'newuser',
      password: 'Password123',
    };

    it('should register a new user', async () => {
      authService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result.accessToken).toBe('access-token');
      expect(result.user.email).toBe(mockUser.email);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123',
    };

    it('should login user and return tokens', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });
  });

  describe('refresh', () => {
    const refreshDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should return new access token', async () => {
      authService.refreshToken.mockResolvedValue({
        accessToken: 'new-access-token',
      });

      const result = await controller.refresh(refreshDto);

      expect(authService.refreshToken).toHaveBeenCalledWith(
        refreshDto.refreshToken,
      );
      expect(result.accessToken).toBe('new-access-token');
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const result = await controller.logout();

      expect(result.message).toBe('Déconnexion réussie');
    });
  });

  describe('getProfile', () => {
    const jwtPayload: JwtPayload = {
      sub: 'user-123',
      email: 'test@example.com',
      role: UserRole.USER,
    };

    it('should return current user profile', async () => {
      authService.getCurrentUser.mockResolvedValue(mockUser);

      const result = await controller.getProfile(jwtPayload);

      expect(authService.getCurrentUser).toHaveBeenCalledWith(jwtPayload.sub);
      expect(result.email).toBe(mockUser.email);
    });
  });
});

