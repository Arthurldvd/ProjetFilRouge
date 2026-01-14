// Tests de validation pour RegisterDto

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from '../../../src/auth/dto/register.dto';

describe('RegisterDto', () => {
  async function validateDto(data: Partial<RegisterDto>) {
    const dto = plainToInstance(RegisterDto, data);
    return validate(dto);
  }

  describe('email', () => {
    it('should pass with valid email', async () => {
      const errors = await validateDto({
        email: 'valid@example.com',
        password: 'Password123',
        username: 'validuser',
      });

      const emailErrors = errors.filter((e) => e.property === 'email');
      expect(emailErrors).toHaveLength(0);
    });

    it('should fail with invalid email', async () => {
      const errors = await validateDto({
        email: 'invalid-email',
        password: 'Password123',
        username: 'validuser',
      });

      const emailErrors = errors.filter((e) => e.property === 'email');
      expect(emailErrors.length).toBeGreaterThan(0);
    });

    it('should fail with empty email', async () => {
      const errors = await validateDto({
        email: '',
        password: 'Password123',
        username: 'validuser',
      });

      const emailErrors = errors.filter((e) => e.property === 'email');
      expect(emailErrors.length).toBeGreaterThan(0);
    });
  });

  describe('password', () => {
    it('should pass with valid password', async () => {
      const errors = await validateDto({
        email: 'valid@example.com',
        password: 'Password123',
        username: 'validuser',
      });

      const passwordErrors = errors.filter((e) => e.property === 'password');
      expect(passwordErrors).toHaveLength(0);
    });

    it('should fail with password too short', async () => {
      const errors = await validateDto({
        email: 'valid@example.com',
        password: 'Pass1',
        username: 'validuser',
      });

      const passwordErrors = errors.filter((e) => e.property === 'password');
      expect(passwordErrors.length).toBeGreaterThan(0);
    });

    it('should fail with password without uppercase', async () => {
      const errors = await validateDto({
        email: 'valid@example.com',
        password: 'password123',
        username: 'validuser',
      });

      const passwordErrors = errors.filter((e) => e.property === 'password');
      expect(passwordErrors.length).toBeGreaterThan(0);
    });

    it('should fail with password without lowercase', async () => {
      const errors = await validateDto({
        email: 'valid@example.com',
        password: 'PASSWORD123',
        username: 'validuser',
      });

      const passwordErrors = errors.filter((e) => e.property === 'password');
      expect(passwordErrors.length).toBeGreaterThan(0);
    });

    it('should fail with password without digit', async () => {
      const errors = await validateDto({
        email: 'valid@example.com',
        password: 'PasswordNoDigit',
        username: 'validuser',
      });

      const passwordErrors = errors.filter((e) => e.property === 'password');
      expect(passwordErrors.length).toBeGreaterThan(0);
    });
  });

  describe('username', () => {
    it('should pass with valid username', async () => {
      const errors = await validateDto({
        email: 'valid@example.com',
        password: 'Password123',
        username: 'validuser',
      });

      const usernameErrors = errors.filter((e) => e.property === 'username');
      expect(usernameErrors).toHaveLength(0);
    });

    it('should fail with username too short', async () => {
      const errors = await validateDto({
        email: 'valid@example.com',
        password: 'Password123',
        username: 'ab',
      });

      const usernameErrors = errors.filter((e) => e.property === 'username');
      expect(usernameErrors.length).toBeGreaterThan(0);
    });

    it('should fail with username too long', async () => {
      const errors = await validateDto({
        email: 'valid@example.com',
        password: 'Password123',
        username: 'a'.repeat(31),
      });

      const usernameErrors = errors.filter((e) => e.property === 'username');
      expect(usernameErrors.length).toBeGreaterThan(0);
    });
  });
});

