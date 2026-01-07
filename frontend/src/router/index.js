// Router Vue 3 pour l'application Quiz
// - Routes publiques : login, register, liste des quiz
// - Routes protégées : création/édition de quiz
// - Guards d'authentification

import { createRouter, createWebHistory } from 'vue-router'
import QuizPage from '../components/QuizPage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import { requireAuth, requireGuest } from './guards'

const routes = [
  // Route principale - Liste des quiz (publique)
  {
    path: '/',
    name: 'quizzes',
    component: QuizPage,
  },

  // Authentification - Accessibles uniquement aux visiteurs
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

  // Routes protégées (exemples pour le futur)
  // {
  //   path: '/quiz/create',
  //   name: 'quiz-create',
  //   component: () => import('../views/QuizCreate.vue'),
  //   beforeEnter: requireAuth,
  //   meta: { requiresAuth: true },
  // },
  // {
  //   path: '/profile',
  //   name: 'profile',
  //   component: () => import('../views/ProfilePage.vue'),
  //   beforeEnter: requireAuth,
  //   meta: { requiresAuth: true },
  // },

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
