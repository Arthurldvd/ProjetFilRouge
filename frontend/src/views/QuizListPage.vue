<script setup lang="ts">
// Page de liste des quiz
// Affiche tous les quiz publiés avec possibilité de jouer ou créer

import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getPublishedQuizzes } from '../services/quizService'
import type { Quiz } from '../services/quizService'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { isAuthenticated } = useAuth()

const quizzes = ref<Quiz[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const hasQuizzes = computed(() => quizzes.value.length > 0)

onMounted(async () => {
  try {
    quizzes.value = await getPublishedQuizzes()
  } catch (e) {
    error.value = 'Impossible de charger les quiz'
    console.error(e)
  } finally {
    isLoading.value = false
  }
})

function playQuiz(quizId: number) {
  router.push(`/quiz/${quizId}/play`)
}

function createQuiz() {
  router.push('/quiz/create')
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="quiz-list-page">
    <div class="container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <h1>Découvrez nos Quiz</h1>
          <p>Testez vos connaissances et défiez-vous !</p>
        </div>
        <button v-if="isAuthenticated" class="create-btn" @click="createQuiz">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Créer un quiz
        </button>
      </header>

      <!-- Loading state -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Chargement des quiz...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2"/>
          <path d="M24 14V26M24 32V34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="$router.go(0)">Réessayer</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="!hasQuizzes" class="empty-state">
        <div class="empty-illustration">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" stroke="currentColor" stroke-width="2" opacity="0.3"/>
            <path d="M45 55C45 55 50 45 60 45C70 45 75 55 75 55" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="45" cy="50" r="3" fill="currentColor" opacity="0.5"/>
            <circle cx="75" cy="50" r="3" fill="currentColor" opacity="0.5"/>
            <path d="M45 75C45 75 50 70 60 70C70 70 75 75 75 75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h2>Aucun quiz disponible</h2>
        <p>Soyez le premier à créer un quiz !</p>
        <button v-if="isAuthenticated" class="create-btn" @click="createQuiz">
          Créer mon premier quiz
        </button>
        <router-link v-else to="/login" class="login-link">
          Connectez-vous pour créer un quiz
        </router-link>
      </div>

      <!-- Quiz grid -->
      <div v-else class="quiz-grid">
        <article 
          v-for="quiz in quizzes" 
          :key="quiz.id" 
          class="quiz-card"
          @click="playQuiz(quiz.id)"
        >
          <div class="quiz-card__header">
            <div class="quiz-card__badge">
              {{ quiz.questions?.length || 0 }} questions
            </div>
          </div>
          
          <div class="quiz-card__body">
            <h3 class="quiz-card__title">{{ quiz.title }}</h3>
            <p v-if="quiz.description" class="quiz-card__description">
              {{ quiz.description }}
            </p>
          </div>
          
          <div class="quiz-card__footer">
            <span class="quiz-card__date">
              {{ formatDate(quiz.createdAt) }}
            </span>
            <button class="play-btn">
              Jouer
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 2L12 8L4 14V2Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-list-page {
  min-height: calc(100vh - 65px);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 3rem;
}

.header-content h1 {
  font-family: 'Sora', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.header-content p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.125rem;
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -8px rgba(99, 102, 241, 0.5);
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  text-align: center;
}

.spinner-large {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.125rem;
}

/* Error state */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  text-align: center;
  color: #fca5a5;
}

.error-state svg {
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.error-state p {
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  text-align: center;
}

.empty-illustration {
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 2rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  color: #fff;
  margin: 0 0 0.75rem;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 2rem;
}

.login-link {
  color: #6366f1;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.login-link:hover {
  color: #8b5cf6;
}

/* Quiz grid */
.quiz-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Quiz card */
.quiz-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.quiz-card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 20px 40px -20px rgba(99, 102, 241, 0.2);
}

.quiz-card__header {
  margin-bottom: 1rem;
}

.quiz-card__badge {
  display: inline-flex;
  padding: 0.375rem 0.75rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 20px;
  color: #a5b4fc;
  font-size: 0.75rem;
  font-weight: 500;
}

.quiz-card__body {
  flex: 1;
  margin-bottom: 1.5rem;
}

.quiz-card__title {
  font-family: 'Sora', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.75rem;
  line-height: 1.3;
}

.quiz-card__description {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9375rem;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.quiz-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.quiz-card__date {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8125rem;
}

.play-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.play-btn:hover {
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-content h1 {
    font-size: 2rem;
  }

  .quiz-grid {
    grid-template-columns: 1fr;
  }
}
</style>

