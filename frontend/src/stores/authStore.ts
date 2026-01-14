// Store Pinia pour la gestion de l'authentification
// Centralise l'état d'auth et expose les actions login/register/logout

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as authService from '../services/authService'
import type { User, LoginCredentials, RegisterData } from '../services/authService'
import { hasToken, clearTokens } from '../services/apiClient'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const currentUser = computed(() => user.value)

  /**
   * Connexion utilisateur
   */
  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)
      user.value = response.user
    } catch (err: unknown) {
      const message = extractErrorMessage(err)
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Inscription utilisateur
   */
  async function register(data: RegisterData): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.register(data)
      user.value = response.user
    } catch (err: unknown) {
      const message = extractErrorMessage(err)
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Déconnexion
   */
  async function logout(): Promise<void> {
    isLoading.value = true

    try {
      await authService.logout()
    } finally {
      user.value = null
      error.value = null
      isLoading.value = false
    }
  }

  /**
   * Rafraîchissement du token
   */
  async function refreshAccessToken(): Promise<void> {
    try {
      await authService.refreshAccessToken()
    } catch {
      // Si le refresh échoue, déconnecter l'utilisateur
      user.value = null
      clearTokens()
      throw new Error('Session expirée, veuillez vous reconnecter')
    }
  }

  /**
   * Récupère l'utilisateur courant depuis l'API
   */
  async function fetchCurrentUser(): Promise<void> {
    if (!hasToken()) {
      user.value = null
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const currentUserData = await authService.getCurrentUser()
      user.value = currentUserData
    } catch {
      // Token invalide ou expiré
      user.value = null
      clearTokens()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Initialise l'auth au démarrage de l'application
   * Vérifie si un token existe et récupère le profil utilisateur
   */
  async function initializeAuth(): Promise<void> {
    if (hasToken()) {
      await fetchCurrentUser()
    }
  }

  /**
   * Efface les erreurs
   */
  function clearError(): void {
    error.value = null
  }

  /**
   * Extrait le message d'erreur d'une exception
   */
  function extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { message?: string | string[] } } }
      const data = axiosError.response?.data
      if (data?.message) {
        return Array.isArray(data.message) ? data.message[0] : data.message
      }
    }
    if (err instanceof Error) {
      return err.message
    }
    return 'Une erreur inattendue est survenue'
  }

  return {
    // State
    user,
    isLoading,
    error,
    // Computed
    isAuthenticated,
    isAdmin,
    currentUser,
    // Actions
    login,
    register,
    logout,
    refreshAccessToken,
    fetchCurrentUser,
    initializeAuth,
    clearError,
  }
})

