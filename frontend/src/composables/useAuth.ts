// Composable pour accéder facilement à l'authentification dans les composants
// Wrapper pratique autour du store auth avec des fonctions utilitaires

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import type { LoginCredentials, RegisterData, User } from '../services/authService'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  // Computed properties
  const user = computed<User | null>(() => authStore.currentUser)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)

  /**
   * Connexion et redirection
   */
  async function login(credentials: LoginCredentials, redirectTo?: string): Promise<void> {
    await authStore.login(credentials)
    router.push(redirectTo || '/')
  }

  /**
   * Inscription et redirection
   */
  async function register(data: RegisterData, redirectTo?: string): Promise<void> {
    await authStore.register(data)
    router.push(redirectTo || '/')
  }

  /**
   * Déconnexion et redirection vers login
   */
  async function logout(): Promise<void> {
    await authStore.logout()
    router.push('/login')
  }

  /**
   * Efface les erreurs d'authentification
   */
  function clearError(): void {
    authStore.clearError()
  }

  /**
   * Initialise l'authentification (utile au montage de l'app)
   */
  async function initializeAuth(): Promise<void> {
    await authStore.initializeAuth()
  }

  return {
    // State
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    // Actions
    login,
    register,
    logout,
    clearError,
    initializeAuth,
  }
}

