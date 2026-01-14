<script setup lang="ts">
// Page d'édition de quiz
// Charge le quiz existant et permet de le modifier

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQuizById, updateQuiz, generateQuestionsWithAI } from '../services/quizService'

const route = useRoute()
const router = useRouter()

const quizId = computed(() => Number(route.params.id))

// Form state
const title = ref('')
const description = ref('')
const isPublished = ref(false)
const questions = ref<{
  id?: number
  text: string
  answers: { id?: number; text: string; isCorrect: boolean }[]
}[]>([])

const isLoading = ref(true)
const isSaving = ref(false)
const error = ref<string | null>(null)
const loadError = ref<string | null>(null)

// AI Generation state
const showAiModal = ref(false)
const aiTheme = ref('')
const aiQuestionCount = ref(5)
const isGenerating = ref(false)
const aiError = ref<string | null>(null)
const retryCountdown = ref(0)
let countdownInterval: ReturnType<typeof setInterval> | null = null

// Validation
const isFormValid = computed(() => {
  if (!title.value.trim()) return false
  if (questions.value.length === 0) return false
  
  return questions.value.every((q) => {
    if (!q.text.trim()) return false
    if (q.answers.length < 2) return false
    if (!q.answers.some((a) => a.isCorrect)) return false
    return q.answers.every((a) => a.text.trim())
  })
})

// Load quiz data
onMounted(async () => {
  try {
    const quiz = await getQuizById(quizId.value)
    title.value = quiz.title
    description.value = quiz.description || ''
    isPublished.value = quiz.isPublished
    questions.value = quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      answers: q.answers.map((a) => ({
        id: a.id,
        text: a.text,
        isCorrect: a.isCorrect,
      })),
    }))
  } catch (e) {
    loadError.value = 'Impossible de charger le quiz'
    console.error(e)
  } finally {
    isLoading.value = false
  }
})

// Add a new question
function addQuestion() {
  questions.value.push({
    text: '',
    answers: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
    ],
  })
}

// Remove a question
function removeQuestion(index: number) {
  questions.value.splice(index, 1)
}

// Add an answer to a question
function addAnswer(questionIndex: number) {
  questions.value[questionIndex].answers.push({
    text: '',
    isCorrect: false,
  })
}

// Remove an answer from a question
function removeAnswer(questionIndex: number, answerIndex: number) {
  const answers = questions.value[questionIndex].answers
  if (answers.length > 2) {
    answers.splice(answerIndex, 1)
  }
}

// Set correct answer (only one per question)
function setCorrectAnswer(questionIndex: number, answerIndex: number) {
  questions.value[questionIndex].answers.forEach((a, i) => {
    a.isCorrect = i === answerIndex
  })
}

// Submit the quiz
async function handleSubmit() {
  if (!isFormValid.value) return
  
  isSaving.value = true
  error.value = null
  
  try {
    await updateQuiz(quizId.value, {
      title: title.value,
      description: description.value || undefined,
      isPublished: isPublished.value,
      questions: questions.value,
    })
    
    router.push('/my-quizzes')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde'
  } finally {
    isSaving.value = false
  }
}

// AI Generation
function openAiModal() {
  aiTheme.value = ''
  aiQuestionCount.value = 5
  aiError.value = null
  showAiModal.value = true
}

function closeAiModal() {
  showAiModal.value = false
  aiTheme.value = ''
  aiError.value = null
}

function startRetryCountdown(seconds: number) {
  // Clear any existing countdown
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  
  retryCountdown.value = seconds
  
  countdownInterval = setInterval(() => {
    retryCountdown.value--
    if (retryCountdown.value <= 0) {
      if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = null
      }
    }
  }, 1000)
}

async function generateWithAi() {
  if (!aiTheme.value.trim()) {
    aiError.value = 'Veuillez entrer un thème'
    return
  }

  // Don't allow generation while countdown is active
  if (retryCountdown.value > 0) {
    return
  }

  isGenerating.value = true
  aiError.value = null

  try {
    const response = await generateQuestionsWithAI({
      theme: aiTheme.value,
      count: aiQuestionCount.value,
    })

    // Add generated questions to the quiz
    response.questions.forEach((q) => {
      questions.value.push({
        text: q.text,
        answers: q.answers.map((a) => ({
          text: a.text,
          isCorrect: a.isCorrect,
        })),
      })
    })

    closeAiModal()
  } catch (e: unknown) {
    // Check if it's a quota exceeded error (429)
    const error = e as { response?: { data?: { retryAfter?: number; statusCode?: number } } }
    if (error.response?.data?.statusCode === 429 && error.response?.data?.retryAfter) {
      startRetryCountdown(error.response.data.retryAfter)
      aiError.value = null // Clear text error, we'll show the countdown instead
    } else {
      aiError.value = e instanceof Error ? e.message : 'Erreur lors de la génération'
    }
  } finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <div class="quiz-edit-page">
    <div class="container">
      <!-- Loading -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Chargement du quiz...</p>
      </div>

      <!-- Load error -->
      <div v-else-if="loadError" class="error-state">
        <p>{{ loadError }}</p>
        <button @click="router.push('/my-quizzes')">Retour à mes quiz</button>
      </div>

      <!-- Edit form -->
      <template v-else>
        <!-- Header -->
        <header class="page-header">
          <button class="back-btn" @click="router.push('/my-quizzes')">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Retour
          </button>
          <h1>Modifier le quiz</h1>
        </header>

        <form @submit.prevent="handleSubmit" class="quiz-form">
          <!-- Error banner -->
          <div v-if="error" class="error-banner">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2"/>
              <path d="M10 6V10M10 14H10.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ error }}
          </div>

          <!-- Quiz info section -->
          <section class="form-section">
            <h2>Informations du quiz</h2>
            
            <div class="form-group">
              <label for="title">Titre du quiz *</label>
              <input
                id="title"
                v-model="title"
                type="text"
                placeholder="Ex: Quiz sur l'histoire de France"
                required
              />
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="description"
                placeholder="Décrivez votre quiz en quelques mots..."
                rows="3"
              ></textarea>
            </div>

            <div class="form-group-inline">
              <label class="checkbox-label">
                <input type="checkbox" v-model="isPublished" />
                <span class="checkbox-custom"></span>
                Quiz publié
              </label>
              <span v-if="!isPublished" class="status-hint">Ce quiz est en brouillon</span>
            </div>
          </section>

          <!-- Questions section -->
          <section class="form-section">
            <div class="section-header">
              <h2>Questions</h2>
              <div class="section-actions">
                <button type="button" class="ai-btn" @click="openAiModal">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1L10 5L14 5.5L11 8.5L12 13L8 10.5L4 13L5 8.5L2 5.5L6 5L8 1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                  </svg>
                  Générer avec l'IA
                </button>
                <button type="button" class="add-btn" @click="addQuestion">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Ajouter une question
                </button>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="questions.length === 0" class="questions-empty">
              <p>Aucune question</p>
              <span>Cliquez sur "Ajouter une question" pour commencer</span>
            </div>

            <!-- Questions list -->
            <div v-else class="questions-list">
              <div 
                v-for="(question, qIndex) in questions" 
                :key="qIndex" 
                class="question-card"
              >
                <div class="question-header">
                  <span class="question-number">Question {{ qIndex + 1 }}</span>
                  <button 
                    type="button" 
                    class="remove-btn"
                    @click="removeQuestion(qIndex)"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>

                <div class="form-group">
                  <input
                    v-model="question.text"
                    type="text"
                    placeholder="Entrez votre question"
                    class="question-input"
                  />
                </div>

                <div class="answers-section">
                  <span class="answers-label">Réponses (cochez la bonne réponse) :</span>
                  
                  <div 
                    v-for="(answer, aIndex) in question.answers" 
                    :key="aIndex"
                    class="answer-row"
                  >
                    <label class="radio-label" :class="{ 'is-correct': answer.isCorrect }">
                      <input 
                        type="radio" 
                        :name="`question-${qIndex}-correct`"
                        :checked="answer.isCorrect"
                        @change="setCorrectAnswer(qIndex, aIndex)"
                      />
                      <span class="radio-custom"></span>
                    </label>
                    
                    <input
                      v-model="answer.text"
                      type="text"
                      :placeholder="`Réponse ${aIndex + 1}`"
                      class="answer-input"
                    />
                    
                    <button 
                      type="button"
                      class="remove-answer-btn"
                      :disabled="question.answers.length <= 2"
                      @click="removeAnswer(qIndex, aIndex)"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </button>
                  </div>

                  <button 
                    type="button" 
                    class="add-answer-btn"
                    @click="addAnswer(qIndex)"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2V12M2 7H12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Ajouter une réponse
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Submit section -->
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="router.push('/my-quizzes')">
              Annuler
            </button>
            <button 
              type="submit" 
              class="submit-btn"
              :disabled="!isFormValid || isSaving"
            >
              <span v-if="isSaving" class="spinner"></span>
              <span v-else>Enregistrer</span>
            </button>
          </div>
        </form>
      </template>
    </div>

    <!-- AI Generation Modal -->
    <Teleport to="body">
      <div v-if="showAiModal" class="modal-overlay" @click.self="closeAiModal">
        <div class="ai-modal">
          <div class="ai-modal-header">
            <div class="ai-modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15 8L22 9L17 14L18 21L12 17L6 21L7 14L2 9L9 8L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Générer des questions avec l'IA</h3>
            <button type="button" class="modal-close" @click="closeAiModal">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="ai-modal-body">
            <p class="ai-description">
              Décrivez le thème de vos questions et l'IA va générer automatiquement des questions à choix multiples.
            </p>

            <!-- Quota warning with countdown -->
            <div v-if="retryCountdown > 0" class="ai-quota-warning">
              <div class="quota-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M10 6V10L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="quota-content">
                <span class="quota-title">Quota API temporairement épuisé</span>
                <span class="quota-timer">Réessayez dans <strong>{{ retryCountdown }}s</strong></span>
              </div>
            </div>

            <div v-else-if="aiError" class="ai-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 5V8M8 11H8.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              {{ aiError }}
            </div>

            <div class="ai-form-group">
              <label for="ai-theme">Thème des questions *</label>
              <input
                id="ai-theme"
                v-model="aiTheme"
                type="text"
                placeholder="Ex: La Seconde Guerre mondiale, Les planètes du système solaire..."
                :disabled="isGenerating"
              />
            </div>

            <div class="ai-form-group">
              <label for="ai-count">Nombre de questions</label>
              <div class="ai-count-selector">
                <button 
                  type="button" 
                  :disabled="aiQuestionCount <= 1 || isGenerating"
                  @click="aiQuestionCount = Math.max(1, aiQuestionCount - 1)"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7H11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
                <span class="ai-count-value">{{ aiQuestionCount }}</span>
                <button 
                  type="button" 
                  :disabled="aiQuestionCount >= 10 || isGenerating"
                  @click="aiQuestionCount = Math.min(10, aiQuestionCount + 1)"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 3V11M3 7H11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="ai-modal-footer">
            <button type="button" class="ai-cancel-btn" @click="closeAiModal" :disabled="isGenerating">
              Annuler
            </button>
            <button 
              type="button" 
              class="ai-generate-btn" 
              @click="generateWithAi"
              :disabled="isGenerating || !aiTheme.trim() || retryCountdown > 0"
            >
              <span v-if="isGenerating" class="ai-spinner"></span>
              <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L10 5L14 5.5L11 8.5L12 13L8 10.5L4 13L5 8.5L2 5.5L6 5L8 1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
              {{ isGenerating ? 'Génération en cours...' : retryCountdown > 0 ? `Patientez ${retryCountdown}s` : 'Générer les questions' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.quiz-edit-page {
  min-height: calc(100vh - 65px);
  padding: 2rem 0;
}

.container {
  max-width: 800px;
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

.loading-state p {
  color: rgba(255, 255, 255, 0.6);
}

.error-state p {
  color: #fca5a5;
  margin-bottom: 1rem;
}

.error-state button {
  padding: 0.75rem 1.5rem;
  background: #6366f1;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
}

/* Header */
.page-header {
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

.page-header h1 {
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

/* Form */
.quiz-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  color: #fca5a5;
  font-size: 0.9375rem;
}

/* Form sections */
.form-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
}

.form-section h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
}

/* Form groups */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* Checkbox */
.form-group-inline {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9375rem;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: all 0.2s;
  position: relative;
}

.checkbox-label input:checked + .checkbox-custom {
  background: #10b981;
  border-color: #10b981;
}

.checkbox-label input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.status-hint {
  font-size: 0.8125rem;
  color: #fbbf24;
}

/* Buttons */
.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  color: #a5b4fc;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: rgba(99, 102, 241, 0.2);
}

/* Questions empty */
.questions-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.4);
}

.questions-empty p {
  font-size: 1rem;
  margin: 0 0 0.25rem;
}

.questions-empty span {
  font-size: 0.875rem;
}

/* Questions list */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 1.25rem;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.question-number {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #a5b4fc;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.remove-btn {
  padding: 0.375rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: #fca5a5;
}

.question-input {
  font-weight: 500;
}

/* Answers */
.answers-section {
  margin-top: 1rem;
}

.answers-label {
  display: block;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.75rem;
}

.answer-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-label input {
  position: absolute;
  opacity: 0;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transition: all 0.2s;
  position: relative;
}

.radio-label input:checked + .radio-custom {
  border-color: #10b981;
}

.radio-label input:checked + .radio-custom::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 4px;
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
}

.radio-label.is-correct .radio-custom {
  border-color: #10b981;
}

.answer-input {
  flex: 1;
  padding: 0.625rem 0.875rem !important;
  font-size: 0.9375rem !important;
}

.remove-answer-btn {
  padding: 0.375rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: color 0.2s;
}

.remove-answer-btn:hover:not(:disabled) {
  color: #fca5a5;
}

.remove-answer-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.add-answer-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.add-answer-btn:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
}

/* Form actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
}

.cancel-btn {
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 160px;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -8px rgba(99, 102, 241, 0.5);
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

/* Section actions */
.section-actions {
  display: flex;
  gap: 0.75rem;
}

/* AI Button */
.ai-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 8px;
  color: #c084fc;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-btn:hover {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%);
  border-color: rgba(168, 85, 247, 0.6);
  color: #d8b4fe;
  transform: translateY(-1px);
}

.ai-btn svg {
  fill: rgba(168, 85, 247, 0.3);
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

/* AI Modal */
.ai-modal {
  background: linear-gradient(180deg, #1a1a2e 0%, #16162a 100%);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), 0 0 80px rgba(168, 85, 247, 0.1);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.ai-modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ai-modal-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
  border-radius: 10px;
  color: #c084fc;
}

.ai-modal-icon svg {
  fill: rgba(168, 85, 247, 0.3);
}

.ai-modal-header h3 {
  flex: 1;
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.modal-close {
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #fff;
}

.ai-modal-body {
  padding: 1.5rem;
}

.ai-description {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9375rem;
  line-height: 1.5;
  margin: 0 0 1.5rem;
}

.ai-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

/* Quota warning */
.ai-quota-warning {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 12px;
  margin-bottom: 1rem;
  animation: pulseWarning 2s ease-in-out infinite;
}

@keyframes pulseWarning {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.2);
  }
  50% { 
    box-shadow: 0 0 20px 0 rgba(251, 191, 36, 0.15);
  }
}

.quota-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(251, 191, 36, 0.2);
  border-radius: 10px;
  color: #fbbf24;
  flex-shrink: 0;
}

.quota-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.quota-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #fbbf24;
}

.quota-timer {
  font-size: 0.8125rem;
  color: rgba(251, 191, 36, 0.8);
}

.quota-timer strong {
  color: #fbbf24;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.ai-form-group {
  margin-bottom: 1.25rem;
}

.ai-form-group:last-child {
  margin-bottom: 0;
}

.ai-form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
}

.ai-form-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.2s;
}

.ai-form-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.ai-form-group input:focus {
  outline: none;
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.05);
}

.ai-form-group input:disabled {
  opacity: 0.5;
}

/* Count selector */
.ai-count-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-count-selector button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.ai-count-selector button:hover:not(:disabled) {
  background: rgba(168, 85, 247, 0.1);
  border-color: rgba(168, 85, 247, 0.3);
  color: #c084fc;
}

.ai-count-selector button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.ai-count-value {
  min-width: 48px;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
}

/* Modal footer */
.ai-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.ai-cancel-btn {
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-cancel-btn:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.ai-cancel-btn:disabled {
  opacity: 0.5;
}

.ai-generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -8px rgba(168, 85, 247, 0.5);
}

.ai-generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.ai-generate-btn svg {
  fill: rgba(255, 255, 255, 0.3);
}

.ai-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Responsive */
@media (max-width: 640px) {
  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }

  .section-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .ai-btn,
  .add-btn {
    width: 100%;
    justify-content: center;
  }

  .ai-modal-footer {
    flex-direction: column;
  }

  .ai-cancel-btn,
  .ai-generate-btn {
    width: 100%;
  }
}
</style>

