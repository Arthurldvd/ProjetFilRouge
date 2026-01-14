<script setup lang="ts">
// Page d'inscription
// Formulaire complet avec indicateur de force du mot de passe

import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

const { register, isLoading, error, clearError } = useAuth()

// Formulaire
const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')

// État local
const touched = ref({
  email: false,
  username: false,
  password: false,
  confirmPassword: false,
})
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Validation email
const emailError = computed(() => {
  if (!touched.value.email) return ''
  if (!email.value) return 'L\'email est requis'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return 'Email invalide'
  return ''
})

// Validation username
const usernameError = computed(() => {
  if (!touched.value.username) return ''
  if (!username.value) return 'Le nom d\'utilisateur est requis'
  if (username.value.length < 3) return 'Minimum 3 caractères'
  if (username.value.length > 30) return 'Maximum 30 caractères'
  return ''
})

// Force du mot de passe
const passwordStrength = computed(() => {
  const pwd = password.value
  let score = 0
  
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[a-z]/.test(pwd)) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++
  
  if (score <= 2) return { level: 'weak', label: 'Faible', color: '#ef4444' }
  if (score <= 4) return { level: 'medium', label: 'Moyen', color: '#f59e0b' }
  return { level: 'strong', label: 'Fort', color: '#10b981' }
})

const passwordError = computed(() => {
  if (!touched.value.password) return ''
  if (!password.value) return 'Le mot de passe est requis'
  if (password.value.length < 8) return 'Minimum 8 caractères'
  if (!/(?=.*[a-z])/.test(password.value)) return 'Une minuscule requise'
  if (!/(?=.*[A-Z])/.test(password.value)) return 'Une majuscule requise'
  if (!/(?=.*\d)/.test(password.value)) return 'Un chiffre requis'
  return ''
})

const confirmPasswordError = computed(() => {
  if (!touched.value.confirmPassword) return ''
  if (!confirmPassword.value) return 'Veuillez confirmer le mot de passe'
  if (confirmPassword.value !== password.value) return 'Les mots de passe ne correspondent pas'
  return ''
})

const isFormValid = computed(() => {
  return (
    email.value &&
    username.value &&
    password.value &&
    confirmPassword.value &&
    !emailError.value &&
    !usernameError.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  )
})

// Soumission du formulaire
async function handleSubmit() {
  touched.value = {
    email: true,
    username: true,
    password: true,
    confirmPassword: true,
  }
  
  if (!isFormValid.value) return
  
  clearError()
  
  try {
    await register({
      email: email.value,
      username: username.value,
      password: password.value,
    })
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
      
      <!-- Carte d'inscription -->
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="currentColor" class="logo-bg"/>
              <path d="M24 14V34M14 24H34" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
          <h1>Créer un compte</h1>
          <p>Rejoignez-nous pour créer et partager vos quiz</p>
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
          
          <!-- Nom d'utilisateur -->
          <div class="form-group" :class="{ 'has-error': usernameError }">
            <label for="username">Nom d'utilisateur</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="6" r="4" stroke="currentColor" stroke-width="1.5"/>
                <path d="M3 18C3 14 6 12 10 12C14 12 17 14 17 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input
                id="username"
                v-model="username"
                type="text"
                placeholder="johndoe"
                autocomplete="username"
                @blur="touched.username = true"
                @input="onInput"
              />
            </div>
            <span v-if="usernameError" class="field-error">{{ usernameError }}</span>
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
                autocomplete="new-password"
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
            
            <!-- Indicateur de force -->
            <div v-if="password" class="password-strength">
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  :style="{ 
                    width: passwordStrength.level === 'weak' ? '33%' : passwordStrength.level === 'medium' ? '66%' : '100%',
                    backgroundColor: passwordStrength.color 
                  }"
                ></div>
              </div>
              <span class="strength-label" :style="{ color: passwordStrength.color }">
                {{ passwordStrength.label }}
              </span>
            </div>
            
            <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
          </div>
          
          <!-- Confirmation mot de passe -->
          <div class="form-group" :class="{ 'has-error': confirmPasswordError }">
            <label for="confirmPassword">Confirmer le mot de passe</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="8" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M7 8V5C7 3.34315 8.34315 2 10 2C11.6569 2 13 3.34315 13 5V8" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 13L9.5 14.5L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="new-password"
                @blur="touched.confirmPassword = true"
                @input="onInput"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showConfirmPassword = !showConfirmPassword"
                tabindex="-1"
              >
                <svg v-if="!showConfirmPassword" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4C4 4 1 10 1 10C1 10 4 16 10 16C16 16 19 10 19 10C19 10 16 4 10 4Z" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 3L17 17M10 4C4 4 1 10 1 10C1 10 2.5 12.5 5 14.5M10 16C16 16 19 10 19 10C19 10 17.5 7.5 15 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <span v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</span>
          </div>
          
          <!-- Bouton de soumission -->
          <button
            type="submit"
            class="submit-btn"
            :disabled="isLoading || !isFormValid"
          >
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Créer mon compte</span>
          </button>
        </form>
        
        <!-- Lien vers connexion -->
        <div class="auth-footer">
          <p>Déjà un compte ?</p>
          <router-link to="/login" class="link">Se connecter</router-link>
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
  background: -gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%);
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
  right: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation-delay: -7s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 40%;
  left: -80px;
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
  margin-bottom: 2rem;
}

.logo {
  display: inline-flex;
  margin-bottom: 1.5rem;
  color: #10b981;
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
  gap: 1.25rem;
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
  color: #10b981;
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
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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

/* Indicateur de force du mot de passe */
.password-strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-label {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Bouton de soumission */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
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
  box-shadow: 0 10px 20px -10px rgba(16, 185, 129, 0.5);
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
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.link:hover {
  color: #06b6d4;
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

