// Service Quiz - Gestion des quiz avec questions à choix multiples
// Stockage en mémoire (prêt pour migration vers DB)

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

export interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  text: string;
  answers: Answer[];
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  isPublished: boolean;
  questions: Question[];
  createdAt: Date;
  authorId?: string;
}

export interface QuizResult {
  quizId: number;
  totalQuestions: number;
  correctAnswers: number;
  score: number; // Pourcentage
  details: {
    questionId: number;
    selectedAnswerId: number;
    correctAnswerId: number;
    isCorrect: boolean;
  }[];
}

@Injectable()
export class QuizService {
  private quizzes: Quiz[] = [];
  private nextId = 1;
  private nextQuestionId = 1;
  private nextAnswerId = 1;

  create(createQuizDto: CreateQuizDto, authorId?: string): Quiz {
    const questions: Question[] = (createQuizDto.questions || []).map((q) => ({
      id: this.nextQuestionId++,
      text: q.text,
      answers: q.answers.map((a) => ({
        id: this.nextAnswerId++,
        text: a.text,
        isCorrect: a.isCorrect,
      })),
    }));

    const quiz: Quiz = {
      id: this.nextId++,
      title: createQuizDto.title,
      description: createQuizDto.description,
      isPublished: createQuizDto.isPublished ?? false,
      questions,
      createdAt: new Date(),
      authorId,
    };

    this.quizzes.push(quiz);
    return quiz;
  }

  findAll(): Quiz[] {
    return this.quizzes;
  }

  findPublished(): Quiz[] {
    return this.quizzes.filter((q) => q.isPublished);
  }

  /**
   * Récupère tous les quiz d'un auteur (publiés et brouillons)
   */
  findByAuthor(authorId: string): Quiz[] {
    return this.quizzes.filter((q) => q.authorId === authorId);
  }

  /**
   * Vérifie si un utilisateur est propriétaire d'un quiz
   */
  isOwner(quizId: number, userId: string): boolean {
    const quiz = this.findOne(quizId);
    return quiz.authorId === userId;
  }

  findOne(id: number): Quiz {
    const quiz = this.quizzes.find((q) => q.id === id);
    if (!quiz) {
      throw new NotFoundException(`Quiz avec l'id ${id} introuvable`);
    }
    return quiz;
  }

  // Retourne le quiz sans les réponses correctes (pour jouer)
  findOneForPlay(id: number): Omit<Quiz, 'questions'> & {
    questions: {
      id: number;
      text: string;
      answers: { id: number; text: string }[];
    }[];
  } {
    const quiz = this.findOne(id);
    return {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        text: q.text,
        answers: q.answers.map((a) => ({
          id: a.id,
          text: a.text,
        })),
      })),
    };
  }

  update(id: number, updateQuizDto: UpdateQuizDto): Quiz {
    const quiz = this.findOne(id);

    let questions = quiz.questions;
    if (updateQuizDto.questions) {
      questions = updateQuizDto.questions.map((q) => ({
        id: q.id || this.nextQuestionId++,
        text: q.text,
        answers: q.answers.map((a) => ({
          id: a.id || this.nextAnswerId++,
          text: a.text,
          isCorrect: a.isCorrect,
        })),
      }));
    }

    const updatedQuiz: Quiz = {
      ...quiz,
      title: updateQuizDto.title ?? quiz.title,
      description: updateQuizDto.description ?? quiz.description,
      isPublished: updateQuizDto.isPublished ?? quiz.isPublished,
      questions,
    };

    this.quizzes = this.quizzes.map((q) => (q.id === id ? updatedQuiz : q));
    return updatedQuiz;
  }

  remove(id: number): void {
    const existing = this.findOne(id);
    this.quizzes = this.quizzes.filter((q) => q.id !== existing.id);
  }

  // Soumettre les réponses et calculer le score
  submitAnswers(
    quizId: number,
    answers: { questionId: number; answerId: number }[],
  ): QuizResult {
    const quiz = this.findOne(quizId);

    const details = quiz.questions.map((question) => {
      const userAnswer = answers.find((a) => a.questionId === question.id);
      const correctAnswer = question.answers.find((a) => a.isCorrect);

      return {
        questionId: question.id,
        selectedAnswerId: userAnswer?.answerId ?? -1,
        correctAnswerId: correctAnswer?.id ?? -1,
        isCorrect: userAnswer?.answerId === correctAnswer?.id,
      };
    });

    const correctAnswers = details.filter((d) => d.isCorrect).length;
    const totalQuestions = quiz.questions.length;

    return {
      quizId,
      totalQuestions,
      correctAnswers,
      score: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
      details,
    };
  }
}
