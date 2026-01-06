import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  isPublished: boolean;
}

@Injectable()
export class QuizService {
  // Stockage en mémoire pour l'exemple (sera remplacé par une base de données plus tard)
  private quizzes: Quiz[] = [];
  private nextId = 1;

  create(createQuizDto: CreateQuizDto): Quiz {
    const quiz: Quiz = {
      id: this.nextId++,
      title: createQuizDto.title,
      description: createQuizDto.description,
      isPublished: createQuizDto.isPublished ?? false,
    };

    this.quizzes.push(quiz);
    return quiz;
  }

  findAll(): Quiz[] {
    return this.quizzes;
  }

  findOne(id: number): Quiz {
    const quiz = this.quizzes.find((q) => q.id === id);
    if (!quiz) {
      throw new NotFoundException(`Quiz avec l'id ${id} introuvable`);
    }
    return quiz;
  }

  update(id: number, updateQuizDto: UpdateQuizDto): Quiz {
    const quiz = this.findOne(id);
    const updatedQuiz: Quiz = {
      ...quiz,
      ...updateQuizDto,
    };

    this.quizzes = this.quizzes.map((q) => (q.id === id ? updatedQuiz : q));
    return updatedQuiz;
  }

  remove(id: number): void {
    const existing = this.findOne(id);
    this.quizzes = this.quizzes.filter((q) => q.id !== existing.id);
  }
}

