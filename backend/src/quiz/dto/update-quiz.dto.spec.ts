import { validate } from 'class-validator';
import { UpdateQuizDto } from './update-quiz.dto';

describe('UpdateQuizDto', () => {
  describe('PartialType behavior', () => {
    it('should accept empty DTO', async () => {
      const dto = new UpdateQuizDto();

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should inherit validation rules from CreateQuizDto', async () => {
      const dto = new UpdateQuizDto();
      dto.title = '';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
      expect(titleError?.constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('title validation', () => {
    it('should accept valid title when provided', async () => {
      const dto = new UpdateQuizDto();
      dto.title = 'Valid Title';

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should accept undefined title', async () => {
      const dto = new UpdateQuizDto();
      dto.title = undefined;

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should reject empty title when provided', async () => {
      const dto = new UpdateQuizDto();
      dto.title = '';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
      expect(titleError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should reject title exceeding 255 characters when provided', async () => {
      const dto = new UpdateQuizDto();
      dto.title = 'a'.repeat(256);

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
      expect(titleError?.constraints).toHaveProperty('maxLength');
    });

    it('should reject non-string title when provided', async () => {
      const dto = new UpdateQuizDto();
      (dto as any).title = 123;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
      expect(titleError?.constraints).toHaveProperty('isString');
    });
  });

  describe('description validation', () => {
    it('should accept valid description when provided', async () => {
      const dto = new UpdateQuizDto();
      dto.description = 'Valid Description';

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should accept undefined description', async () => {
      const dto = new UpdateQuizDto();
      dto.description = undefined;

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should reject non-string description when provided', async () => {
      const dto = new UpdateQuizDto();
      (dto as any).description = 123;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const descriptionError = errors.find((e) => e.property === 'description');
      expect(descriptionError).toBeDefined();
      expect(descriptionError?.constraints).toHaveProperty('isString');
    });
  });

  describe('isPublished validation', () => {
    it('should accept true when provided', async () => {
      const dto = new UpdateQuizDto();
      dto.isPublished = true;

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should accept false when provided', async () => {
      const dto = new UpdateQuizDto();
      dto.isPublished = false;

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should accept undefined isPublished', async () => {
      const dto = new UpdateQuizDto();
      dto.isPublished = undefined;

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should reject non-boolean isPublished when provided', async () => {
      const dto = new UpdateQuizDto();
      (dto as any).isPublished = 'true';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const isPublishedError = errors.find((e) => e.property === 'isPublished');
      expect(isPublishedError).toBeDefined();
      expect(isPublishedError?.constraints).toHaveProperty('isBoolean');
    });
  });

  describe('complete DTO validation', () => {
    it('should accept valid DTO with all fields', async () => {
      const dto = new UpdateQuizDto();
      dto.title = 'Test Quiz';
      dto.description = 'Test Description';
      dto.isPublished = true;

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should accept valid DTO with single field', async () => {
      const dto = new UpdateQuizDto();
      dto.title = 'Test Quiz';

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should accept valid empty DTO', async () => {
      const dto = new UpdateQuizDto();

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should reject DTO with provided but empty title', async () => {
      const dto = new UpdateQuizDto();
      dto.title = '';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const titleError = errors.find((e) => e.property === 'title');
      expect(titleError).toBeDefined();
    });

    it('should reject DTO with invalid isPublished type', async () => {
      const dto = new UpdateQuizDto();
      (dto as any).isPublished = 123;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const isPublishedError = errors.find((e) => e.property === 'isPublished');
      expect(isPublishedError).toBeDefined();
    });
  });
});

