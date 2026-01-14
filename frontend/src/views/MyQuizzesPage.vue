<script setup lang="ts">
// Page de gestion des quiz de l'utilisateur
// Affiche les quiz publiés et brouillons avec actions éditer/supprimer

import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getMyQuizzes, deleteQuiz } from '../services/quizService'
import type { Quiz } from '../services/quizService'

const router = useRouter()

const quizzes = ref<Quiz[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const deleteConfirmId = ref<number | null>(null)
const isDeleting = ref(false)

// Séparer les quiz publiés et les brouillons
const publishedQuizzes = computed(() => quizzes.value.filter((q) => q.isPublished))
const draftQuizzes = computed(() => quizzes.value.filter((q) => !q.isPublished))

onMounted(async () => {
  await loadQuizzes()
})

async function loadQuizzes() {
  isLoading.value = true
  error.value = null
  
  try {
    quizzes.value = await getMyQuizzes()
  } catch (e) {
    error.value = 'Impossible de charger vos quiz'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

function editQuiz(quizId: number) {
  router.push(`/quiz/${quizId}/edit`)
}

function playQuiz(quizId: number) {
  router.push(`/quiz/${quizId}/play`)
}

function confirmDelete(quizId: number) {
  deleteConfirmId.value = quizId
}

function cancelDelete() {
  deleteConfirmId.value = null
}

async function handleDelete() {
  if (!deleteConfirmId.value || isDeleting.value) return
  
  isDeleting.value = true
  
  try {
    await deleteQuiz(deleteConfirmId.value)
    quizzes.value = quizzes.value.filter((q) => q.id !== deleteConfirmId.value)
    deleteConfirmId.value = null
  } catch (e) {
    error.value = 'Erreur lors de la suppression'
    console.error(e)
  } finally {
    isDeleting.value = false
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function createQuiz() {
  router.push('/quiz/create')
}
</script>

<template>
  <div class="my-quizzes-page">
    <div class="container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <h1>Mes Quiz</h1>
          <p>Gérez vos quiz, modifiez-les ou publiez vos brouillons</p>
        </div>
        <button class="create-btn" @click="createQuiz">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Créer un quiz
        </button>
      </header>

      <!-- Loading state -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Chargement de vos quiz...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button class="retry-btn" @click="loadQuizzes">Réessayer</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="quizzes.length === 0" class="empty-state">
        <div class="empty-illustration">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <rect x="15" y="20" width="70" height="60" rx="8" stroke="currentColor" stroke-width="2" opacity="0.3"/>
            <line x1="25" y1="35" x2="55" y2="35" stroke="currentColor" stroke-width="2" opacity="0.3"/>
            <line x1="25" y1="50" x2="75" y2="50" stroke="currentColor" stroke-width="2" opacity="0.3"/>
            <line x1="25" y1="65" x2="65" y2="65" stroke="currentColor" stroke-width="2" opacity="0.3"/>
          </svg>
        </div>
        <h2>Vous n'avez pas encore de quiz</h2>
        <p>Créez votre premier quiz et partagez-le avec le monde !</p>
        <button class="create-btn" @click="createQuiz">
          Créer mon premier quiz
        </button>
      </div>

      <!-- Quiz sections -->
      <div v-else class="quiz-sections">
        <!-- Brouillons -->
        <section v-if="draftQuizzes.length > 0" class="quiz-section">
          <div class="section-header">
            <h2>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14.5 2.5L17.5 5.5L6.5 16.5H3.5V13.5L14.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Brouillons
            </h2>
            <span class="count">{{ draftQuizzes.length }}</span>
          </div>
          
          <div class="quiz-list">
            <article 
              v-for="quiz in draftQuizzes" 
              :key="quiz.id" 
              class="quiz-item draft"
            >
              <div class="quiz-item__main">
                <div class="quiz-item__info">
                  <h3>{{ quiz.title }}</h3>
                  <p v-if="quiz.description">{{ quiz.description }}</p>
                  <div class="quiz-item__meta">
                    <span class="badge draft-badge">Brouillon</span>
                    <span class="meta-item">{{ quiz.questions?.length || 0 }} questions</span>
                    <span class="meta-item">{{ formatDate(quiz.createdAt) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="quiz-item__actions">
                <button class="action-btn edit-btn" @click="editQuiz(quiz.id)" title="Modifier">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M13 2L16 5L5.5 15.5H2.5V12.5L13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="action-btn delete-btn" @click="confirmDelete(quiz.id)" title="Supprimer">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 5H15M6 5V3C6 2.44772 6.44772 2 7 2H11C11.5523 2 12 2.44772 12 3V5M14 5V15C14 15.5523 13.5523 16 13 16H5C4.44772 16 4 15.5523 4 15V5H14Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </article>
          </div>
        </section>

        <!-- Publiés -->
        <section v-if="publishedQuizzes.length > 0" class="quiz-section">
          <div class="section-header">
            <h2>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/>
                <path d="M7 10L9 12L13 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Publiés
            </h2>
            <span class="count">{{ publishedQuizzes.length }}</span>
          </div>
          
          <div class="quiz-list">
            <article 
              v-for="quiz in publishedQuizzes" 
              :key="quiz.id" 
              class="quiz-item published"
            >
              <div class="quiz-item__main">
                <div class="quiz-item__info">
                  <h3>{{ quiz.title }}</h3>
                  <p v-if="quiz.description">{{ quiz.description }}</p>
                  <div class="quiz-item__meta">
                    <span class="badge published-badge">Publié</span>
                    <span class="meta-item">{{ quiz.questions?.length || 0 }} questions</span>
                    <span class="meta-item">{{ formatDate(quiz.createdAt) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="quiz-item__actions">
                <button class="action-btn play-btn" @click="playQuiz(quiz.id)" title="Jouer">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M5 3L15 9L5 15V3Z" fill="currentColor"/>
                  </svg>
                </button>
                <button class="action-btn edit-btn" @click="editQuiz(quiz.id)" title="Modifier">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M13 2L16 5L5.5 15.5H2.5V12.5L13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="action-btn delete-btn" @click="confirmDelete(quiz.id)" title="Supprimer">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 5H15M6 5V3C6 2.44772 6.44772 2 7 2H11C11.5523 2 12 2.44772 12 3V5M14 5V15C14 15.5523 13.5523 16 13 16H5C4.44772 16 4 15.5523 4 15V5H14Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div v-if="deleteConfirmId !== null" class="modal-overlay" @click="cancelDelete">
        <div class="modal" @click.stop>
          <div class="modal-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2"/>
              <path d="M24 14V26M24 32V34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3>Supprimer ce quiz ?</h3>
          <p>Cette action est irréversible. Le quiz et toutes ses questions seront définitivement supprimés.</p>
          <div class="modal-actions">
            <button class="cancel-btn" @click="cancelDelete" :disabled="isDeleting">
              Annuler
            </button>
            <button class="confirm-delete-btn" @click="handleDelete" :disabled="isDeleting">
              <span v-if="isDeleting" class="spinner"></span>
              <span v-else>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.my-quizzes-page {
  min-height: calc(100vh - 65px);
  padding: 2rem 0;
}

.container {
  max-width: 900px;
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
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.5rem;
}

.header-content p {
  color: rgba(255, 255, 255, 0.6);
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

/* Loading & Error & Empty states */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
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
.empty-state p {
  color: rgba(255, 255, 255, 0.5);
}

.error-state p {
  color: #fca5a5;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  cursor: pointer;
}

.empty-illustration {
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 1.5rem;
}

.empty-state h2 {
  font-size: 1.25rem;
  color: #fff;
  margin: 0 0 0.5rem;
}

.empty-state .create-btn {
  margin-top: 1.5rem;
}

/* Quiz sections */
.quiz-sections {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.quiz-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.section-header h2 svg {
  color: rgba(255, 255, 255, 0.5);
}

.count {
  padding: 0.25rem 0.625rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

/* Quiz list */
.quiz-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quiz-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: all 0.2s;
}

.quiz-item:hover {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
}

.quiz-item__main {
  flex: 1;
  min-width: 0;
}

.quiz-item__info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quiz-item__info p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quiz-item__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.draft-badge {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.published-badge {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.meta-item {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.4);
}

/* Actions */
.quiz-item__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.play-btn:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.edit-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}

.modal {
  background: #1a1a3e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.modal-icon {
  color: #fca5a5;
  margin-bottom: 1rem;
}

.modal h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.75rem;
}

.modal p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9375rem;
  margin: 0 0 1.5rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.cancel-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.confirm-delete-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #ef4444;
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: #dc2626;
}

.confirm-delete-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Responsive */
@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .quiz-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .quiz-item__actions {
    justify-content: flex-end;
  }
}
</style>

