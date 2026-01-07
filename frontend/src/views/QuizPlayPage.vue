<script setup lang="ts">
// Page pour jouer à un quiz
// Affiche les questions une par une avec sélection de réponse

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQuizForPlay, submitQuiz } from '../services/quizService'
import type { QuizForPlay, QuizResult } from '../services/quizService'

const route = useRoute()
const router = useRouter()

const quiz = ref<QuizForPlay | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Game state
const currentQuestionIndex = ref(0)
const selectedAnswers = ref<Map<number, number>>(new Map())
const isSubmitting = ref(false)
const result = ref<QuizResult | null>(null)

const quizId = computed(() => Number(route.params.id))
const currentQuestion = computed(() => quiz.value?.questions[currentQuestionIndex.value])
const totalQuestions = computed(() => quiz.value?.questions.length || 0)
const isFirstQuestion = computed(() => currentQuestionIndex.value === 0)
const isLastQuestion = computed(() => currentQuestionIndex.value === totalQuestions.value - 1)
const progress = computed(() => ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100)
const allAnswered = computed(() => selectedAnswers.value.size === totalQuestions.value)

// Load quiz
onMounted(async () => {
  try {
    quiz.value = await getQuizForPlay(quizId.value)
  } catch (e) {
    error.value = 'Impossible de charger le quiz'
    console.error(e)
  } finally {
    isLoading.value = false
  }
})

// Select an answer
function selectAnswer(answerId: number) {
  if (!currentQuestion.value || result.value) return
  selectedAnswers.value.set(currentQuestion.value.id, answerId)
}

// Navigation
function nextQuestion() {
  if (!isLastQuestion.value) {
    currentQuestionIndex.value++
  }
}

function previousQuestion() {
  if (!isFirstQuestion.value) {
    currentQuestionIndex.value--
  }
}

function goToQuestion(index: number) {
  currentQuestionIndex.value = index
}

// Submit quiz
async function handleSubmit() {
  if (!allAnswered.value || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    const answers = Array.from(selectedAnswers.value.entries()).map(([questionId, answerId]) => ({
      questionId,
      answerId,
    }))
    
    result.value = await submitQuiz(quizId.value, answers)
  } catch (e) {
    error.value = 'Erreur lors de la soumission'
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}

// Restart quiz
function restartQuiz() {
  selectedAnswers.value.clear()
  currentQuestionIndex.value = 0
  result.value = null
}

// Get score color
function getScoreColor(score: number) {
  if (score >= 80) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}
</script>

<template>
  <div class="quiz-play-page">
    <div class="container">
      <!-- Loading -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Chargement du quiz...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="router.push('/')">Retour à l'accueil</button>
      </div>

      <!-- Results -->
      <div v-else-if="result" class="results-container">
        <div class="results-card">
          <div class="results-header">
            <div 
              class="score-circle"
              :style="{ '--score-color': getScoreColor(result.score) }"
            >
              <span class="score-value">{{ Math.round(result.score) }}%</span>
              <span class="score-label">Score</span>
            </div>
          </div>

          <div class="results-body">
            <h1>Quiz terminé !</h1>
            <p class="results-summary">
              Vous avez répondu correctement à 
              <strong>{{ result.correctAnswers }}</strong> 
              question{{ result.correctAnswers > 1 ? 's' : '' }} sur 
              <strong>{{ result.totalQuestions }}</strong>
            </p>

            <div class="results-details">
              <div 
                v-for="(detail, index) in result.details" 
                :key="detail.questionId"
                class="result-item"
                :class="{ correct: detail.isCorrect, incorrect: !detail.isCorrect }"
              >
                <span class="result-number">Q{{ index + 1 }}</span>
                <span class="result-icon">
                  <svg v-if="detail.isCorrect" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6 11L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div class="results-actions">
            <button class="secondary-btn" @click="restartQuiz">
              Rejouer
            </button>
            <button class="primary-btn" @click="router.push('/')">
              Retour aux quiz
            </button>
          </div>
        </div>
      </div>

      <!-- Quiz content -->
      <div v-else-if="quiz" class="quiz-container">
        <!-- Quiz header -->
        <header class="quiz-header">
          <button class="back-btn" @click="router.push('/')">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Quitter
          </button>
          <h1>{{ quiz.title }}</h1>
        </header>

        <!-- Progress bar -->
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
          <span class="progress-text">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
        </div>

        <!-- Question navigation dots -->
        <div class="question-nav">
          <button 
            v-for="(q, index) in quiz.questions" 
            :key="q.id"
            class="nav-dot"
            :class="{ 
              active: index === currentQuestionIndex,
              answered: selectedAnswers.has(q.id)
            }"
            @click="goToQuestion(index)"
          >
            {{ index + 1 }}
          </button>
        </div>

        <!-- Question card -->
        <div v-if="currentQuestion" class="question-card">
          <h2 class="question-text">{{ currentQuestion.text }}</h2>

          <div class="answers-list">
            <button
              v-for="answer in currentQuestion.answers"
              :key="answer.id"
              class="answer-btn"
              :class="{ selected: selectedAnswers.get(currentQuestion.id) === answer.id }"
              @click="selectAnswer(answer.id)"
            >
              <span class="answer-indicator"></span>
              <span class="answer-text">{{ answer.text }}</span>
            </button>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="quiz-navigation">
          <button 
            class="nav-btn prev-btn" 
            :disabled="isFirstQuestion"
            @click="previousQuestion"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Précédent
          </button>

          <button 
            v-if="!isLastQuestion"
            class="nav-btn next-btn" 
            @click="nextQuestion"
          >
            Suivant
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8 4L14 10L8 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button 
            v-else
            class="submit-btn" 
            :disabled="!allAnswered || isSubmitting"
            @click="handleSubmit"
          >
            <span v-if="isSubmitting" class="spinner"></span>
            <span v-else>Terminer le quiz</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-play-page {
  min-height: calc(100vh - 65px);
  padding: 2rem 0;
}

.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Loading & Error */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.spinner-large {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p,
.error-state p {
  color: rgba(255, 255, 255, 0.6);
}

.error-state button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #6366f1;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
}

/* Quiz header */
.quiz-header {
  margin-bottom: 2rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.back-btn:hover {
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.quiz-header h1 {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

/* Progress */
.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  white-space: nowrap;
}

/* Question navigation */
.question-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.nav-dot {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-dot:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.nav-dot.active {
  background: #6366f1;
  border-color: #6366f1;
  color: #fff;
}

.nav-dot.answered:not(.active) {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

/* Question card */
.question-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.question-text {
  font-family: 'Sora', sans-serif;
  font-size: 1.375rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 2rem;
  line-height: 1.4;
}

/* Answers */
.answers-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.answer-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.answer-btn:hover {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.05);
}

.answer-btn.selected {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.answer-indicator {
  width: 22px;
  height: 22px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.2s;
  position: relative;
}

.answer-btn.selected .answer-indicator {
  border-color: #6366f1;
  background: #6366f1;
}

.answer-btn.selected .answer-indicator::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 6px;
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
}

.answer-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  line-height: 1.4;
}

/* Navigation */
.quiz-navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 180px;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -8px rgba(16, 185, 129, 0.5);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Results */
.results-container {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.results-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.results-header {
  margin-bottom: 2rem;
}

.score-circle {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  border: 4px solid var(--score-color);
}

.score-value {
  font-family: 'Sora', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--score-color);
  line-height: 1;
}

.score-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.25rem;
}

.results-body h1 {
  font-family: 'Sora', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1rem;
}

.results-summary {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.0625rem;
  margin: 0 0 2rem;
}

.results-summary strong {
  color: #fff;
}

.results-details {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  font-size: 0.8125rem;
}

.result-number {
  color: rgba(255, 255, 255, 0.6);
}

.result-item.correct .result-icon {
  color: #10b981;
}

.result-item.incorrect .result-icon {
  color: #ef4444;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.secondary-btn {
  padding: 0.875rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-btn:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.primary-btn {
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -8px rgba(99, 102, 241, 0.5);
}

/* Responsive */
@media (max-width: 640px) {
  .question-card {
    padding: 1.5rem;
  }

  .question-text {
    font-size: 1.125rem;
  }

  .quiz-navigation {
    flex-direction: column;
  }

  .results-actions {
    flex-direction: column;
  }
}
</style>

