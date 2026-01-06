import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Enregistrement global de Pinia (state management)
const pinia = createPinia()
app.use(pinia)

// Enregistrement du router Vue
app.use(router)

app.mount('#app')
