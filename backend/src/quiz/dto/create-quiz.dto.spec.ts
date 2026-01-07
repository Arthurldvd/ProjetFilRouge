import { validate } from 'class-validator';
import { CreateQuizDto } from './create-quiz.dto';

describe('CreateQuizDto', () => {
  describe('title validation', () => {
    it('should accept valid string title', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'Valid Title';

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should reject empty title', async () => {
      const dto = new CreateQuizDto();
      dto.title = '';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
      expect(titleError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should reject non-string title', async () => {
      const dto = new CreateQuizDto();
      (dto as any).title = 123;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
      expect(titleError?.constraints).toHaveProperty('isString');
    });

    it('should reject title exceeding 255 characters', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'a'.repeat(256);

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
      expect(titleError?.constraints).toHaveProperty('maxLength');
    });

    it('should accept title with exactly 255 characters', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'a'.repeat(255);

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should reject null title', async () => {
      const dto = new CreateQuizDto();
      (dto as any).title = null;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject undefined title', async () => {
      const dto = new CreateQuizDto();
      (dto as any).title = undefined;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('description validation', () => {
    it('should accept valid string description', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'Valid Title';
      dto.description = 'Valid Description';

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should accept undefined description', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'Valid Title';
      dto.description = undefined;

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should accept null description', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'Valid Title';
      (dto as any).description = null;

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should accept empty string description', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'Valid Title';
      dto.description = '';

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should reject non-string description when provided', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'Valid Title';
      (dto as any).description = 123;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const descriptionError = errors.find((e) => e.property === 'description');
      expect(descriptionError).toBeDefined();
      expect(descriptionError?.constraints).toHaveProperty('isString');
    });
  });

  describe('isPublished validation', () => {
    it('should accept true', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'Valid Title';
      dto.isPublished = true;

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should accept false', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'Valid Title';
      dto.isPublished = false;

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should accept undefined isPublished', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'Valid Title';
      dto.isPublished = undefined;

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should reject string isPublished', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'Valid Title';
      (dto as any).isPublished = 'true';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const isPublishedError = errors.find((e) => e.property === 'isPublished');
      expect(isPublishedError).toBeDefined();
      expect(isPublishedError?.constraints).toHaveProperty('isBoolean');
    });

    it('should reject number isPublished', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'Valid Title';
      (dto as any).isPublished = 1;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const isPublishedError = errors.find((e) => e.property === 'isPublished');
      expect(isPublishedError).toBeDefined();
      expect(isPublishedError?.constraints).toHaveProperty('isBoolean');
    });
  });

  describe('complete DTO validation', () => {
    it('should accept valid DTO with all fields', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'Test Quiz';
      dto.description = 'Test Description';
      dto.isPublished = true;

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should accept valid DTO with only title', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'Test Quiz';

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should reject DTO with missing title', async () => {
      const dto = new CreateQuizDto();

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
    });

    it('should reject DTO with title too long', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'a'.repeat(300);

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
      expect(titleError?.constraints).toHaveProperty('maxLength');
    });

    it('should reject DTO with invalid isPublished type', async () => {
      const dto = new CreateQuizDto();
      dto.title = 'Test Quiz';
      (dto as any).isPublished = 'invalid';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const isPublishedError = errors.find((e) => e.property === 'isPublished');
      expect(isPublishedError).toBeDefined();
    });
  });
});
