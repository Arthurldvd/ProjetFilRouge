<script setup lang="ts">
// Page d'édition de quiz
// Charge le quiz existant et permet de le modifier

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQuizById, updateQuiz } from '../services/quizService'

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
              <button type="button" class="add-btn" @click="addQuestion">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Ajouter une question
              </button>
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

/* Responsive */
@media (max-width: 640px) {
  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>

