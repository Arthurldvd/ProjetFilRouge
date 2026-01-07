// Tests unitaires pour UsersService
// Couvre : create, findByEmail, findById, validatePassword

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../src/users/users.service';
import { UserRole } from '../../src/users/entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const user = await service.create(
        'test@example.com',
        'testuser',
        'Password123',
      );

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.password).not.toBe('Password123'); // Should be hashed
      expect(user.role).toBe(UserRole.USER);
      expect(user.isActive).toBe(true);
    });

    it('should create admin user when role is specified', async () => {
      const user = await service.create(
        'admin@example.com',
        'admin',
        'Password123',
        UserRole.ADMIN,
      );

      expect(user.role).toBe(UserRole.ADMIN);
    });

    it('should throw ConflictException if email already exists', async () => {
      await service.create('duplicate@example.com', 'user1', 'Password123');

      await expect(
        service.create('duplicate@example.com', 'user2', 'Password123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if username already exists', async () => {
      await service.create('user1@example.com', 'duplicateuser', 'Password123');

      await expect(
        service.create('user2@example.com', 'duplicateuser', 'Password123'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('should return user if found', async () => {
      await service.create('find@example.com', 'finduser', 'Password123');

      const user = await service.findByEmail('find@example.com');

      expect(user).toBeDefined();
      expect(user?.email).toBe('find@example.com');
    });

    it('should return null if user not found', async () => {
      const user = await service.findByEmail('notfound@example.com');

      expect(user).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return user if found', async () => {
      await service.create(
        'username@example.com',
        'uniqueusername',
        'Password123',
      );

      const user = await service.findByUsername('uniqueusername');

      expect(user).toBeDefined();
      expect(user?.username).toBe('uniqueusername');
    });

    it('should return null if user not found', async () => {
      const user = await service.findByUsername('nonexistent');

      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      const createdUser = await service.create(
        'byid@example.com',
        'byiduser',
        'Password123',
      );

      const user = await service.findById(createdUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
    });

    it('should return null if user not found', async () => {
      const user = await service.findById('nonexistent-id');

      expect(user).toBeNull();
    });
  });

  describe('findByIdOrFail', () => {
    it('should return user if found', async () => {
      const createdUser = await service.create(
        'orfail@example.com',
        'orfailuser',
        'Password123',
      );

      const user = await service.findByIdOrFail(createdUser.id);

      expect(user.id).toBe(createdUser.id);
    });

    it('should throw NotFoundException if user not found', async () => {
      await expect(service.findByIdOrFail('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validatePassword', () => {
    it('should return true for correct password', async () => {
      const user = await service.create(
        'validate@example.com',
        'validateuser',
        'Password123',
      );

      const isValid = await service.validatePassword(
        'Password123',
        user.password,
      );

      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await service.create(
        'invalid@example.com',
        'invaliduser',
        'Password123',
      );

      const isValid = await service.validatePassword(
        'WrongPassword',
        user.password,
      );

      expect(isValid).toBe(false);
    });
  });

  describe('touch', () => {
    it('should update updatedAt timestamp', async () => {
      const user = await service.create(
        'touch@example.com',
        'touchuser',
        'Password123',
      );
      const originalUpdatedAt = user.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      await service.touch(user.id);

      const updatedUser = await service.findById(user.id);
      expect(updatedUser?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });
  });
});

