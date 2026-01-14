import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)

// Enregistrement global de Pinia (state management)
const pinia = createPinia()
app.use(pinia)

// Enregistrement du router Vue
app.use(router)

// Initialisation de l'authentification avant le montage
const authStore = useAuthStore()
authStore.initializeAuth().finally(() => {
  app.mount('#app')
})
