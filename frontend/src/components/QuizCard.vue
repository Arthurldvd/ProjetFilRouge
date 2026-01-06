<template>
  <div class="quiz-card">
    <!-- État de chargement -->
    <p v-if="isLoading" class="quiz-card__info">Chargement du quiz...</p>

    <!-- État d'erreur -->
    <p v-else-if="error" class="quiz-card__error">
      Erreur : {{ error }}
    </p>

    <!-- Aucun quiz sélectionné -->
    <p v-else-if="!currentQuiz" class="quiz-card__info">
      Aucun quiz sélectionné.
    </p>

    <!-- Affichage du quiz sélectionné -->
    <div v-else class="quiz-card__content">
      <h2 class="quiz-card__title">{{ currentQuiz.title }}</h2>

      <p class="quiz-card__description">
        {{ currentQuiz.description || 'Aucune description disponible.' }}
      </p>

      <p class="quiz-card__status">
        Statut :
        <span :class="currentQuiz.isPublished ? 'status--published' : 'status--draft'">
          {{ currentQuiz.isPublished ? 'Publié' : 'Brouillon' }}
        </span>
      </p>

      <button
        class="quiz-card__button"
        :disabled="isUpdating"
        @click="onTogglePublication"
      >
        {{ currentQuiz.isPublished ? 'Dépublier' : 'Publier' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Composant "smart" minimal : il ne reçoit pas de props pour le quiz.
// Il lit directement dans le store Pinia, ce qui le rend réutilisable
// dans n'importe quel parent tant que le store est disponible.

import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useQuizStore } from '@/stores/quizStore'

const quizStore = useQuizStore()

// storeToRefs permet d'obtenir des références réactives aux propriétés du store
const { currentQuiz, isLoading, isUpdating, error, quizzes } = storeToRefs(quizStore)
const { fetchQuizzes, updateQuizPublication } = quizStore

// Au montage du composant, on s'assure que les quizzes sont chargés.
// (On ne fait pas d'appel HTTP direct ici, on délègue simplement au store.)
onMounted(() => {
  if (!quizzes.value.length) {
    void fetchQuizzes()
  }
})

// Fonction appelée lors du clic sur le bouton de publication
const onTogglePublication = async () => {
  if (!currentQuiz.value) return

  const newStatus = !currentQuiz.value.isPublished
  await updateQuizPublication(currentQuiz.value.id, newStatus)
}
</script>

<style scoped>
.quiz-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  max-width: 400px;
  background-color: #fff;
}

.quiz-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.quiz-card__description {
  margin-bottom: 0.75rem;
  color: #555;
}

.quiz-card__status {
  margin-bottom: 0.75rem;
}

.status--published {
  color: #15803d;
  font-weight: 600;
}

.status--draft {
  color: #b91c1c;
  font-weight: 600;
}

.quiz-card__button {
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: none;
  background-color: #2563eb;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.quiz-card__button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.quiz-card__info {
  color: #6b7280;
}

.quiz-card__error {
  color: #b91c1c;
  font-weight: 500;
}
</style>

