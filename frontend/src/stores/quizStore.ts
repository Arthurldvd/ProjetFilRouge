// Store Pinia responsable :
// - de récupérer la liste des quizzes depuis l'API NestJS
// - de stocker l'état (loading, erreurs, quiz sélectionné)
// - de mettre à jour le statut de publication d'un quiz

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// Type TypeScript décrivant un Quiz tel que renvoyé par l'API NestJS
export interface Quiz {
  id: number
  title: string
  description?: string
  isPublished: boolean
}

export const useQuizStore = defineStore('quiz', () => {
  // Liste complète des quizzes
  const quizzes = ref<Quiz[]>([])
  // Identifiant du quiz actuellement sélectionné (affiché par QuizCard)
  const selectedQuizId = ref<number | null>(null)

  // États de chargement / erreur
  const isLoading = ref(false)
  const isUpdating = ref(false)
  const error = ref<string | null>(null)

  // URL de base de l'API (backend NestJS)
  const API_URL = 'http://localhost:3000/quizzes'

  // Quiz actuellement sélectionné, ou null si aucun
  const currentQuiz = computed<Quiz | null>(() => {
    if (selectedQuizId.value == null) return null
    return quizzes.value.find((q) => q.id === selectedQuizId.value) ?? null
  })

  // Action : récupérer tous les quizzes depuis l’API
  async function fetchQuizzes() {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`)
      }

      const data = (await response.json()) as Quiz[]
      quizzes.value = data

      // Si aucun quiz n'est encore sélectionné, on prend le premier par défaut
      if (data.length > 0 && selectedQuizId.value == null) {
        selectedQuizId.value = data[0].id
      }
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Erreur inconnue lors du chargement des quizzes'
    } finally {
      isLoading.value = false
    }
  }

  // Action : sélectionner un quiz à afficher dans le composant QuizCard
  function selectQuiz(id: number | null) {
    selectedQuizId.value = id
  }

  // Action : mettre à jour le statut de publication d'un quiz via l’API (PUT)
  async function updateQuizPublication(id: number, isPublished: boolean) {
    isUpdating.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished }),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`)
      }

      const updatedQuiz = (await response.json()) as Quiz

      // On met à jour la liste locale pour rester synchronisé avec le backend
      quizzes.value = quizzes.value.map((q) =>
        q.id === updatedQuiz.id ? updatedQuiz : q,
      )
    } catch (err: unknown) {
      error.value =
        err instanceof Error
          ? err.message
          : 'Erreur inconnue lors de la mise à jour du quiz'
    } finally {
      isUpdating.value = false
    }
  }

  return {
    // state
    quizzes,
    selectedQuizId,
    isLoading,
    isUpdating,
    error,
    // computed
    currentQuiz,
    // actions
    fetchQuizzes,
    selectQuiz,
    updateQuizPublication,
  }
})

