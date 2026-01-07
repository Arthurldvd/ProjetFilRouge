// Service Quiz - Appels API pour les quiz
// Gère CRUD et gameplay des quiz

import apiClient from './apiClient'

// Types
export interface Answer {
  id?: number
  text: string
  isCorrect: boolean
}

export interface Question {
  id?: number
  text: string
  answers: Answer[]
}

export interface Quiz {
  id: number
  title: string
  description?: string
  isPublished: boolean
  questions: Question[]
  createdAt: string
  authorId?: string
}

export interface QuizForPlay {
  id: number
  title: string
  description?: string
  questions: {
    id: number
    text: string
    answers: { id: number; text: string }[]
  }[]
}

export interface QuizResult {
  quizId: number
  totalQuestions: number
  correctAnswers: number
  score: number
  details: {
    questionId: number
    selectedAnswerId: number
    correctAnswerId: number
    isCorrect: boolean
  }[]
}

export interface CreateQuizData {
  title: string
  description?: string
  isPublished?: boolean
  questions?: {
    text: string
    answers: { text: string; isCorrect: boolean }[]
  }[]
}

export interface SubmitAnswer {
  questionId: number
  answerId: number
}

export interface GeneratedQuestion {
  text: string
  answers: {
    text: string
    isCorrect: boolean
  }[]
}

export interface GenerateQuestionsData {
  theme: string
  count: number
}

export interface GenerateQuestionsResponse {
  questions: GeneratedQuestion[]
}

// API calls

/**
 * Récupérer tous les quiz publiés
 */
export const getPublishedQuizzes = async (): Promise<Quiz[]> => {
  const response = await apiClient.get<Quiz[]>('/quizzes')
  return response.data
}

/**
 * Récupérer tous les quiz (auth required)
 */
export const getAllQuizzes = async (): Promise<Quiz[]> => {
  const response = await apiClient.get<Quiz[]>('/quizzes/all')
  return response.data
}

/**
 * Récupérer mes quiz (publiés et brouillons)
 */
export const getMyQuizzes = async (): Promise<Quiz[]> => {
  const response = await apiClient.get<Quiz[]>('/quizzes/mine')
  return response.data
}

/**
 * Récupérer un quiz par son ID
 */
export const getQuizById = async (id: number): Promise<Quiz> => {
  const response = await apiClient.get<Quiz>(`/quizzes/${id}`)
  return response.data
}

/**
 * Récupérer un quiz pour jouer (sans les bonnes réponses)
 */
export const getQuizForPlay = async (id: number): Promise<QuizForPlay> => {
  const response = await apiClient.get<QuizForPlay>(`/quizzes/${id}/play`)
  return response.data
}

/**
 * Créer un nouveau quiz
 */
export const createQuiz = async (data: CreateQuizData): Promise<Quiz> => {
  const response = await apiClient.post<Quiz>('/quizzes', data)
  return response.data
}

/**
 * Mettre à jour un quiz
 */
export const updateQuiz = async (id: number, data: Partial<CreateQuizData>): Promise<Quiz> => {
  const response = await apiClient.put<Quiz>(`/quizzes/${id}`, data)
  return response.data
}

/**
 * Supprimer un quiz
 */
export const deleteQuiz = async (id: number): Promise<void> => {
  await apiClient.delete(`/quizzes/${id}`)
}

/**
 * Soumettre les réponses à un quiz
 */
export const submitQuiz = async (quizId: number, answers: SubmitAnswer[]): Promise<QuizResult> => {
  const response = await apiClient.post<QuizResult>(`/quizzes/${quizId}/submit`, { answers })
  return response.data
}

/**
 * Générer des questions avec l'IA
 */
export const generateQuestionsWithAI = async (
  data: GenerateQuestionsData
): Promise<GenerateQuestionsResponse> => {
  const response = await apiClient.post<GenerateQuestionsResponse>(
    '/quizzes/generate-questions',
    data
  )
  return response.data
}

