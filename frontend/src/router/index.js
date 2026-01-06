// Router Vue 3 pour l'application Quiz
// - Route principale vers la page des quizzes
// - Facilement extensible pour d'autres pages plus tard

import { createRouter, createWebHistory } from 'vue-router'
import QuizPage from '../components/QuizPage.vue'

const routes = [
  {
    path: '/',
    name: 'quizzes',
    component: QuizPage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

