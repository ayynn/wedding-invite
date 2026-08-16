import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { applyShareMeta } from '@/utils/shareMeta'
import '@/assets/css/main.css'

applyShareMeta()
createApp(App).use(router).mount('#app')
