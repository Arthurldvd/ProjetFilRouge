import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import type { Quiz } from './quiz.service';

describe('QuizController', () => {
  let controller: QuizController;
  let quizService: jest.Mocked<QuizService>;

  beforeEach(async () => {
    const mockQuizService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        {
          provide: QuizService,
          useValue: mockQuizService,
        },
      ],
    }).compile();

    controller = module.get<QuizController>(QuizController);
    quizService = module.get(QuizService) as jest.Mocked<QuizService>;
  });

  describe('create', () => {
    it('should call quizService.create with correct DTO', () => {
      const dto: CreateQuizDto = {
        title: 'Test Quiz',
        description: 'Test Description',
        isPublished: true,
      };
      const mockQuiz: Quiz = {
        id: 1,
        title: dto.title,
        description: dto.description,
        isPublished: dto.isPublished,
      };

      quizService.create.mockReturnValue(mockQuiz);

      const result = controller.create(dto);

      expect(quizService.create).toHaveBeenCalledTimes(1);
      expect(quizService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockQuiz);
    });

    it('should return the result from quizService.create', () => {
      const dto: CreateQuizDto = { title: 'Test Quiz' };
      const mockQuiz: Quiz = {
        id: 1,
        title: 'Test Quiz',
        isPublished: false,
      };

      quizService.create.mockReturnValue(mockQuiz);

      const result = controller.create(dto);

      expect(result).toEqual(mockQuiz);
    });
  });

  describe('findAll', () => {
    it('should call quizService.findAll', () => {
      quizService.findAll.mockReturnValue([]);

      const result = controller.findAll();

      expect(quizService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should return all quizzes from service', () => {
      const mockQuizzes: Quiz[] = [
        { id: 1, title: 'Quiz 1', isPublished: false },
        { id: 2, title: 'Quiz 2', isPublished: true },
        { id: 3, title: 'Quiz 3', description: 'Description', isPublished: false },
      ];

      quizService.findAll.mockReturnValue(mockQuizzes);

      const result = controller.findAll();

      expect(result).toEqual(mockQuizzes);
      expect(result.length).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should call quizService.findOne with correct id', () => {
      const mockQuiz: Quiz = {
        id: 1,
        title: 'Test Quiz',
        isPublished: false,
      };

      quizService.findOne.mockReturnValue(mockQuiz);

      const result = controller.findOne(1);

      expect(quizService.findOne).toHaveBeenCalledTimes(1);
      expect(quizService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockQuiz);
    });

    it('should propagate NotFoundException from service', () => {
      quizService.findOne.mockImplementation(() => {
        throw new NotFoundException("Quiz avec l'id 999 introuvable");
      });

      expect(() => controller.findOne(999)).toThrow(NotFoundException);
      expect(() => controller.findOne(999)).toThrow("Quiz avec l'id 999 introuvable");
    });
  });

  describe('update', () => {
    it('should call quizService.update with correct id and DTO', () => {
      const dto: UpdateQuizDto = {
        title: 'Updated Title',
        isPublished: true,
      };
      const mockUpdatedQuiz: Quiz = {
        id: 1,
        title: 'Updated Title',
        isPublished: true,
      };

      quizService.update.mockReturnValue(mockUpdatedQuiz);

      const result = controller.update(1, dto);

      expect(quizService.update).toHaveBeenCalledTimes(1);
      expect(quizService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockUpdatedQuiz);
    });

    it('should propagate NotFoundException from service', () => {
      quizService.update.mockImplementation(() => {
        throw new NotFoundException("Quiz avec l'id 999 introuvable");
      });

      expect(() => controller.update(999, {})).toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should call quizService.remove with correct id', () => {
      quizService.remove.mockReturnValue(undefined);

      controller.remove(1);

      expect(quizService.remove).toHaveBeenCalledTimes(1);
      expect(quizService.remove).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException from service', () => {
      quizService.remove.mockImplementation(() => {
        throw new NotFoundException("Quiz avec l'id 999 introuvable");
      });

      expect(() => controller.remove(999)).toThrow(NotFoundException);
    });
  });
});

