// Service d'authentification
// Encapsule les appels API pour l'auth (login, register, refresh, etc.)

import apiClient, { setTokens, clearTokens, getRefreshToken } from './apiClient'

// Types pour les données d'authentification
export interface User {
  id: string
  email: string
  username: string
  role: 'user' | 'admin'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  username: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RefreshResponse {
  accessToken: string
}

/**
 * Connexion utilisateur
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
  const { accessToken, refreshToken, user } = response.data

  // Stocker les tokens
  setTokens(accessToken, refreshToken)

  return response.data
}

/**
 * Inscription utilisateur
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data)
  const { accessToken, refreshToken } = response.data

  // Stocker les tokens
  setTokens(accessToken, refreshToken)

  return response.data
}

/**
 * Rafraîchissement du token
 */
export const refreshAccessToken = async (): Promise<RefreshResponse> => {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error('Pas de refresh token disponible')
  }

  const response = await apiClient.post<RefreshResponse>('/auth/refresh', {
    refreshToken,
  })

  // Mettre à jour l'access token
  const { accessToken } = response.data
  const currentRefresh = getRefreshToken()
  if (currentRefresh) {
    setTokens(accessToken, currentRefresh)
  }

  return response.data
}

/**
 * Déconnexion
 */
export const logout = async (): Promise<void> => {
  try {
    // Appeler l'endpoint de logout côté backend
    await apiClient.post('/auth/logout')
  } catch {
    // Ignorer les erreurs, on déconnecte quand même côté client
  } finally {
    clearTokens()
  }
}

/**
 * Récupérer le profil de l'utilisateur connecté
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me')
  return response.data
}

