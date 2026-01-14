// Guards de navigation Vue Router
// - requireAuth : Redirige vers login si non authentifié
// - requireGuest : Redirige vers dashboard si déjà authentifié
// - requireAdmin : Vérifie que l'utilisateur est admin

import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { hasToken } from '../services/apiClient'

/**
 * Guard pour les routes nécessitant une authentification
 * Redirige vers /login si l'utilisateur n'est pas connecté
 */
export const requireAuth = async (
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> => {
  const authStore = useAuthStore()

  // Si pas de token, rediriger vers login
  if (!hasToken()) {
    next({ name: 'login', query: { redirect: _to.fullPath } })
    return
  }

  // Si pas d'utilisateur chargé, tenter de le récupérer
  if (!authStore.isAuthenticated) {
    await authStore.initializeAuth()
  }

  // Vérifier à nouveau après l'initialisation
  if (!authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: _to.fullPath } })
    return
  }

  next()
}

/**
 * Guard pour les routes réservées aux visiteurs (login, register)
 * Redirige vers la page d'accueil si déjà authentifié
 */
export const requireGuest = async (
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> => {
  const authStore = useAuthStore()

  // Si un token existe, vérifier la validité
  if (hasToken()) {
    if (!authStore.isAuthenticated) {
      await authStore.initializeAuth()
    }

    if (authStore.isAuthenticated) {
      next({ name: 'quizzes' })
      return
    }
  }

  next()
}

/**
 * Guard pour les routes réservées aux administrateurs
 * Redirige vers la page d'accueil si l'utilisateur n'est pas admin
 */
export const requireAdmin = async (
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> => {
  const authStore = useAuthStore()

  // Si pas de token, rediriger vers login
  if (!hasToken()) {
    next({ name: 'login', query: { redirect: _to.fullPath } })
    return
  }

  // Si pas d'utilisateur chargé, tenter de le récupérer
  if (!authStore.isAuthenticated) {
    await authStore.initializeAuth()
  }

  // Vérifier l'authentification
  if (!authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: _to.fullPath } })
    return
  }

  // Vérifier le rôle admin
  if (!authStore.isAdmin) {
    next({ name: 'quizzes' })
    return
  }

  next()
}

