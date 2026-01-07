import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

describe('QuizService', () => {
  let service: QuizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizService],
    }).compile();

    service = module.get<QuizService>(QuizService);
  });

  describe('create', () => {
    it('should create a quiz with all fields', () => {
      const dto: CreateQuizDto = {
        title: 'Test Quiz',
        description: 'Test Description',
        isPublished: true,
      };

      const result = service.create(dto);

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(dto.title);
      expect(result.description).toBe(dto.description);
      expect(result.isPublished).toBe(dto.isPublished);
      expect(service.findAll()).toContainEqual(result);
    });

    it('should create a quiz with only title', () => {
      const dto: CreateQuizDto = {
        title: 'Test Quiz',
      };

      const result = service.create(dto);

      expect(result.isPublished).toBe(false);
      expect(result.description).toBeUndefined();
    });

    it('should auto-increment quiz IDs', () => {
      const dto1: CreateQuizDto = { title: 'Quiz 1' };
      const dto2: CreateQuizDto = { title: 'Quiz 2' };
      const dto3: CreateQuizDto = { title: 'Quiz 3' };

      const quiz1 = service.create(dto1);
      const quiz2 = service.create(dto2);
      const quiz3 = service.create(dto3);

      expect(quiz1.id).toBe(1);
      expect(quiz2.id).toBe(2);
      expect(quiz3.id).toBe(3);
    });

    it('should add created quiz to quizzes array', () => {
      const initialLength = service.findAll().length;
      const dto: CreateQuizDto = { title: 'Test Quiz' };

      const result = service.create(dto);

      expect(service.findAll().length).toBe(initialLength + 1);
      expect(service.findAll()).toContainEqual(result);
    });

    it('should create multiple quizzes with unique sequential IDs', () => {
      const quizzes = [];
      for (let i = 1; i <= 5; i++) {
        quizzes.push(service.create({ title: `Quiz ${i}` }));
      }

      const ids = quizzes.map((q) => q.id);
      expect(ids).toEqual([1, 2, 3, 4, 5]);
      expect(new Set(ids).size).toBe(5);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no quizzes exist', () => {
      const result = service.findAll();
      expect(result).toEqual([]);
    });

    it('should return all created quizzes', () => {
      service.create({ title: 'Quiz 1' });
      service.create({ title: 'Quiz 2' });
      service.create({ title: 'Quiz 3' });

      const result = service.findAll();
      expect(result.length).toBe(3);
    });

    it('should return quizzes in creation order', () => {
      const quiz1 = service.create({ title: 'First Quiz' });
      const quiz2 = service.create({ title: 'Second Quiz' });
      const quiz3 = service.create({ title: 'Third Quiz' });

      const result = service.findAll();
      expect(result[0]).toEqual(quiz1);
      expect(result[1]).toEqual(quiz2);
      expect(result[2]).toEqual(quiz3);
    });
  });

  describe('findOne', () => {
    it('should return quiz when id exists', () => {
      const createdQuiz = service.create({ title: 'Test Quiz' });

      const result = service.findOne(createdQuiz.id);

      expect(result).toEqual(createdQuiz);
    });

    it('should throw NotFoundException when id does not exist', () => {
      expect(() => service.findOne(999)).toThrow(NotFoundException);
      expect(() => service.findOne(999)).toThrow("Quiz avec l'id 999 introuvable");
    });

    it('should return correct quiz for different IDs', () => {
      const quiz1 = service.create({ title: 'Quiz 1' });
      const quiz2 = service.create({ title: 'Quiz 2' });
      const quiz3 = service.create({ title: 'Quiz 3' });

      expect(service.findOne(1)).toEqual(quiz1);
      expect(service.findOne(2)).toEqual(quiz2);
      expect(service.findOne(3)).toEqual(quiz3);
    });
  });

  describe('update', () => {
    it('should update only title', () => {
      const quiz = service.create({ title: 'Original Title', description: 'Original Description', isPublished: false });

      const result = service.update(quiz.id, { title: 'New Title' });

      expect(result.title).toBe('New Title');
      expect(result.description).toBe('Original Description');
      expect(result.isPublished).toBe(false);
    });

    it('should update only description', () => {
      const quiz = service.create({ title: 'Original Title', description: 'Original Description', isPublished: false });

      const result = service.update(quiz.id, { description: 'New Description' });

      expect(result.title).toBe('Original Title');
      expect(result.description).toBe('New Description');
      expect(result.isPublished).toBe(false);
    });

    it('should update only isPublished', () => {
      const quiz = service.create({ title: 'Test Quiz', isPublished: false });

      const result = service.update(quiz.id, { isPublished: true });

      expect(result.title).toBe('Test Quiz');
      expect(result.isPublished).toBe(true);
    });

    it('should update multiple fields simultaneously', () => {
      const quiz = service.create({ title: 'Original Title', isPublished: false });

      const result = service.update(quiz.id, { title: 'New Title', isPublished: true });

      expect(result.title).toBe('New Title');
      expect(result.isPublished).toBe(true);
    });

    it('should throw NotFoundException when updating non-existent quiz', () => {
      expect(() => service.update(999, { title: 'Test' })).toThrow(NotFoundException);
    });

    it('should not affect other quizzes when updating one', () => {
      const quiz1 = service.create({ title: 'Quiz 1' });
      const quiz2 = service.create({ title: 'Quiz 2' });
      const quiz3 = service.create({ title: 'Quiz 3' });

      service.update(quiz2.id, { title: 'Updated Quiz 2' });

      expect(service.findOne(quiz1.id).title).toBe('Quiz 1');
      expect(service.findOne(quiz2.id).title).toBe('Updated Quiz 2');
      expect(service.findOne(quiz3.id).title).toBe('Quiz 3');
    });

    it('should return updated quiz', () => {
      const quiz = service.create({ title: 'Original Title' });

      const result = service.update(quiz.id, { title: 'New Title' });

      expect(result.title).toBe('New Title');
      expect(result.id).toBe(quiz.id);
    });

    it('should update with empty DTO without changing anything', () => {
      const quiz = service.create({ title: 'Original Title', description: 'Original Description', isPublished: true });
      const originalTitle = quiz.title;
      const originalDescription = quiz.description;
      const originalIsPublished = quiz.isPublished;

      const result = service.update(quiz.id, {});

      expect(result.title).toBe(originalTitle);
      expect(result.description).toBe(originalDescription);
      expect(result.isPublished).toBe(originalIsPublished);
    });
  });

  describe('remove', () => {
    it('should remove existing quiz', () => {
      const quiz = service.create({ title: 'Test Quiz' });
      const quizId = quiz.id;

      service.remove(quizId);

      expect(service.findAll()).not.toContainEqual(quiz);
    });

    it('should throw NotFoundException when removing non-existent quiz', () => {
      expect(() => service.remove(999)).toThrow(NotFoundException);
    });

    it('should not affect other quizzes when removing one', () => {
      const quiz1 = service.create({ title: 'Quiz 1' });
      const quiz2 = service.create({ title: 'Quiz 2' });
      const quiz3 = service.create({ title: 'Quiz 3' });

      service.remove(quiz2.id);

      expect(service.findOne(quiz1.id)).toBeDefined();
      expect(service.findOne(quiz3.id)).toBeDefined();
      expect(() => service.findOne(quiz2.id)).toThrow(NotFoundException);
    });

    it('should remove multiple quizzes correctly', () => {
      const quiz1 = service.create({ title: 'Quiz 1' });
      const quiz2 = service.create({ title: 'Quiz 2' });
      const quiz3 = service.create({ title: 'Quiz 3' });

      service.remove(quiz1.id);
      service.remove(quiz3.id);

      expect(service.findAll().length).toBe(1);
      expect(service.findOne(quiz2.id)).toBeDefined();
      expect(() => service.findOne(quiz1.id)).toThrow(NotFoundException);
      expect(() => service.findOne(quiz3.id)).toThrow(NotFoundException);
    });

    it('should make findOne throw after removal', () => {
      const quiz = service.create({ title: 'Test Quiz' });
      const quizId = quiz.id;

      service.remove(quizId);

      expect(() => service.findOne(quizId)).toThrow(NotFoundException);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete lifecycle: create -> find -> update -> remove', () => {
      const dto: CreateQuizDto = { title: 'Lifecycle Quiz', description: 'Test', isPublished: false };
      
      const created = service.create(dto);
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();

      const found = service.findOne(created.id);
      expect(found).toEqual(created);

      const updated = service.update(created.id, { isPublished: true });
      expect(updated.isPublished).toBe(true);

      service.remove(created.id);
      expect(() => service.findOne(created.id)).toThrow(NotFoundException);
    });

    it('should continue incrementing IDs after deletion', () => {
      const quiz1 = service.create({ title: 'Quiz 1' });
      const quiz2 = service.create({ title: 'Quiz 2' });
      const quiz3 = service.create({ title: 'Quiz 3' });

      expect(quiz1.id).toBe(1);
      expect(quiz2.id).toBe(2);
      expect(quiz3.id).toBe(3);

      service.remove(quiz2.id);

      const quiz4 = service.create({ title: 'Quiz 4' });
      expect(quiz4.id).toBe(4);
    });
  });
});

