<template>
  <div class="quiz-page">
    <section class="quiz-page__sidebar">
      <h1>Liste des quizzes</h1>

      <ul class="quiz-page__list">
        <li
          v-for="quiz in quizzes"
          :key="quiz.id"
          class="quiz-page__item"
        >
          <button
            class="quiz-page__item-button"
            :class="{ 'quiz-page__item-button--active': quiz.id === selectedQuizId }"
            @click="selectQuiz(quiz.id)"
          >
            {{ quiz.title }}
          </button>
        </li>
      </ul>
    </section>

    <section class="quiz-page__content">
      <QuizCard />
    </section>
  </div>
</template>

<script setup lang="ts">
// Ce composant joue le rôle de "page" parent :
// - il déclenche le chargement initial des quizzes
// - il permet à l'utilisateur de choisir quel quiz sera affiché dans QuizCard

import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuizStore } from '@/stores/quizStore'
import QuizCard from './QuizCard.vue'

const quizStore = useQuizStore()
const { quizzes, selectedQuizId } = storeToRefs(quizStore)
const { fetchQuizzes, selectQuiz } = quizStore

// Chargement initial des quizzes au montage
onMounted(() => {
  void fetchQuizzes()
})
</script>

<style scoped>
.quiz-page {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding: 1.5rem;
}

.quiz-page__sidebar {
  min-width: 220px;
}

.quiz-page__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.quiz-page__item {
  margin-bottom: 0.5rem;
}

.quiz-page__item-button {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background-color: #f9fafb;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.quiz-page__item-button--active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}
</style>

