// Router Vue 3 pour l'application Quiz
// - Routes publiques : accueil, login, register, jouer à un quiz
// - Routes protégées : création, édition, mes quiz

import { createRouter, createWebHistory } from 'vue-router'
import QuizListPage from '../views/QuizListPage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import QuizCreatePage from '../views/QuizCreatePage.vue'
import QuizEditPage from '../views/QuizEditPage.vue'
import QuizPlayPage from '../views/QuizPlayPage.vue'
import MyQuizzesPage from '../views/MyQuizzesPage.vue'
import { requireAuth, requireGuest } from './guards'

const routes = [
  // Page d'accueil - Liste des quiz publiés
  {
    path: '/',
    name: 'home',
    component: QuizListPage,
  },

  // Authentification
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    beforeEnter: requireGuest,
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    beforeEnter: requireGuest,
    meta: { guest: true },
  },

  // Mes quiz (protégé)
  {
    path: '/my-quizzes',
    name: 'my-quizzes',
    component: MyQuizzesPage,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true },
  },

  // Quiz - Création (protégé)
  {
    path: '/quiz/create',
    name: 'quiz-create',
    component: QuizCreatePage,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true },
  },

  // Quiz - Édition (protégé)
  {
    path: '/quiz/:id/edit',
    name: 'quiz-edit',
    component: QuizEditPage,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true },
  },

  // Quiz - Jouer (public)
  {
    path: '/quiz/:id/play',
    name: 'quiz-play',
    component: QuizPlayPage,
  },

  // Redirection pour les routes inconnues
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
