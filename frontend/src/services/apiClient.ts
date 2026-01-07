// Client HTTP Axios avec intercepteurs pour la gestion automatique des tokens
// - Ajout automatique du token Authorization
// - Refresh automatique sur 401
// - Gestion centralisée des erreurs

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

// URL de base de l'API backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Clés de stockage localStorage
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

// Création de l'instance Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Variable pour éviter les appels multiples de refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

/**
 * Traite la file d'attente des requêtes échouées après un refresh
 */
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

/**
 * Intercepteur de requête - Ajoute le token Authorization
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

/**
 * Intercepteur de réponse - Gère le refresh automatique sur 401
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si erreur 401 et qu'on n'a pas déjà réessayé
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Si c'est une route d'auth, ne pas tenter de refresh
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error)
      }

      // Si un refresh est déjà en cours, mettre la requête en file d'attente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

      if (!refreshToken) {
        // Pas de refresh token, déconnecter l'utilisateur
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Appel à l'endpoint de refresh
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken } = response.data

        // Stocker le nouveau token
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)

        // Mettre à jour le header de la requête originale
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        // Traiter la file d'attente
        processQueue(null, accessToken)

        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh échoué, déconnecter l'utilisateur
        processQueue(refreshError, null)
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

/**
 * Stocke les tokens dans localStorage
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

/**
 * Récupère l'access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * Récupère le refresh token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Supprime tous les tokens
 */
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * Vérifie si un token existe
 */
export const hasToken = (): boolean => {
  return !!localStorage.getItem(ACCESS_TOKEN_KEY)
}

export default apiClient

