<script setup lang="ts">
// Shell principal de l'application
// Inclut la navigation et le contenu des pages via router-view

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from './composables/useAuth'

const { user, isAuthenticated, logout, isLoading } = useAuth()
const route = useRoute()

// Masquer la nav sur les pages d'auth
const isAuthPage = computed(() => {
  return route.meta?.guest === true
})

const userInitial = computed(() => {
  if (!user.value) return ''
  return user.value.username?.charAt(0).toUpperCase() || user.value.email?.charAt(0).toUpperCase()
})

async function handleLogout() {
  await logout()
}
</script>

<template>
  <div class="app-container">
    <!-- Navigation (masquée sur les pages d'auth) -->
    <header v-if="!isAuthPage" class="app-header">
      <div class="header-content">
        <!-- Logo -->
        <router-link to="/" class="logo-link">
          <div class="logo">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="10" fill="currentColor"/>
              <path d="M14 24L20 30L34 16" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="logo-text">QuizApp</span>
          </div>
        </router-link>

        <!-- Navigation -->
        <nav class="nav-links">
          <router-link to="/" class="nav-link">Quiz</router-link>
        </nav>

        <!-- Auth section -->
        <div class="auth-section">
          <template v-if="isAuthenticated && user">
            <div class="user-menu">
              <div class="user-avatar">{{ userInitial }}</div>
              <span class="user-name">{{ user.username }}</span>
              <button 
                class="logout-btn" 
                @click="handleLogout"
                :disabled="isLoading"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </template>
          <template v-else>
            <router-link to="/login" class="auth-link">Connexion</router-link>
            <router-link to="/register" class="auth-btn">S'inscrire</router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main :class="{ 'with-header': !isAuthPage }">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
}

/* Header */
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.875rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

/* Logo */
.logo-link {
  text-decoration: none;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #6366f1;
}

.logo-text {
  font-family: 'Sora', 'Segoe UI', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}

/* Navigation */
.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link.router-link-exact-active {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

/* Auth section */
.auth-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-link {
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
}

.auth-link:hover {
  color: #fff;
}

.auth-btn {
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s;
}

.auth-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* User menu */
.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
}

.user-name {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.logout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Main content */
main {
  min-height: 100vh;
}

main.with-header {
  min-height: calc(100vh - 65px);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: 0.75rem 1rem;
  }

  .logo-text {
    display: none;
  }

  .nav-links {
    display: none;
  }

  .user-name {
    display: none;
  }
}
</style>
