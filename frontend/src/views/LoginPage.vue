<script setup lang="ts">
// Page de connexion
// Formulaire email/password avec validation et feedback visuel

import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { login, isLoading, error, clearError, isAuthenticated } = useAuth()
const route = useRoute()

// Formulaire
const email = ref('')
const password = ref('')

// État local
const touched = ref({ email: false, password: false })
const showPassword = ref(false)

// Validation
const emailError = computed(() => {
  if (!touched.value.email) return ''
  if (!email.value) return 'L\'email est requis'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return 'Email invalide'
  return ''
})

const passwordError = computed(() => {
  if (!touched.value.password) return ''
  if (!password.value) return 'Le mot de passe est requis'
  return ''
})

const isFormValid = computed(() => {
  return email.value && password.value && !emailError.value && !passwordError.value
})

// Soumission du formulaire
async function handleSubmit() {
  touched.value = { email: true, password: true }
  
  if (!isFormValid.value) return
  
  clearError()
  
  try {
    const redirectTo = route.query.redirect as string | undefined
    await login({ email: email.value, password: password.value }, redirectTo)
  } catch {
    // L'erreur est gérée par le store
  }
}

// Effacer l'erreur quand l'utilisateur tape
function onInput() {
  if (error.value) {
    clearError()
  }
}

onMounted(() => {
  // Focus sur l'email au chargement
  document.getElementById('email')?.focus()
})
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Décoration de fond -->
      <div class="background-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      
      <!-- Carte de connexion -->
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="currentColor" class="logo-bg"/>
              <path d="M14 24L20 30L34 16" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1>Bon retour !</h1>
          <p>Connectez-vous pour accéder à vos quiz</p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="auth-form">
          <!-- Erreur globale -->
          <div v-if="error" class="error-banner">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2"/>
              <path d="M10 6V10M10 14H10.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>{{ error }}</span>
          </div>
          
          <!-- Email -->
          <div class="form-group" :class="{ 'has-error': emailError }">
            <label for="email">Email</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5L10 11L17 5M3 15H17V5H3V15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="votre@email.com"
                autocomplete="email"
                @blur="touched.email = true"
                @input="onInput"
              />
            </div>
            <span v-if="emailError" class="field-error">{{ emailError }}</span>
          </div>
          
          <!-- Mot de passe -->
          <div class="form-group" :class="{ 'has-error': passwordError }">
            <label for="password">Mot de passe</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="8" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M7 8V5C7 3.34315 8.34315 2 10 2C11.6569 2 13 3.34315 13 5V8" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                @blur="touched.password = true"
                @input="onInput"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4C4 4 1 10 1 10C1 10 4 16 10 16C16 16 19 10 19 10C19 10 16 4 10 4Z" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 3L17 17M10 4C4 4 1 10 1 10C1 10 2.5 12.5 5 14.5M10 16C16 16 19 10 19 10C19 10 17.5 7.5 15 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
          </div>
          
          <!-- Bouton de soumission -->
          <button
            type="submit"
            class="submit-btn"
            :disabled="isLoading || !isFormValid"
          >
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Se connecter</span>
          </button>
        </form>
        
        <!-- Lien vers inscription -->
        <div class="auth-footer">
          <p>Pas encore de compte ?</p>
          <router-link to="/register" class="link">Créer un compte</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-container {
  position: relative;
  width: 100%;
  max-width: 440px;
}

/* Formes décoratives de fond */
.background-shapes {
  position: absolute;
  inset: -100px;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  animation: float 20s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -50px;
  left: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
  animation-delay: -7s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: -80px;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* Carte principale */
.auth-card {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* En-tête */
.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo {
  display: inline-flex;
  margin-bottom: 1.5rem;
  color: #6366f1;
}

.logo-bg {
  fill: currentColor;
}

.auth-header h1 {
  font-family: 'Sora', 'Segoe UI', sans-serif;
  font-size: 1.875rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.auth-header p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9375rem;
  margin: 0;
}

/* Formulaire */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  color: #fca5a5;
  font-size: 0.875rem;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
  transition: color 0.2s;
}

.input-wrapper:focus-within .input-icon {
  color: #6366f1;
}

.form-group input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-group input:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-group.has-error input {
  border-color: #ef4444;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: rgba(255, 255, 255, 0.7);
}

.field-error {
  font-size: 0.8125rem;
  color: #fca5a5;
}

/* Bouton de soumission */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.5);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
.auth-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.auth-footer p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  margin: 0;
}

.link {
  color: #6366f1;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.link:hover {
  color: #8b5cf6;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-page {
    padding: 1rem;
  }
  
  .auth-card {
    padding: 2rem 1.5rem;
  }
  
  .auth-header h1 {
    font-size: 1.5rem;
  }
}
</style>

