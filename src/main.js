import { createApp, defineAsyncComponent } from 'vue'
import { createWebHistory, createRouter } from 'vue-router'
import App from './App.vue'
import './index.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: defineAsyncComponent(() => import('./pages/home.vue')) },
    { path: '/about', component: defineAsyncComponent(() => import('./pages/about.vue')) }
  ],
})

if (import.meta.env.MODE === 'production' && typeof window !== 'undefined') {

  // normal usage without router
  // import('./pwa')

  // forcing workbox errors: the current version just works as expected
  // import('pwa')

  // normal usage with router
  router.isReady().then(async() => {
   const { registerSW } = await import('virtual:pwa-register')
   registerSW({ immediate: true })
  })
}


createApp(App).use(router).mount('#app')
