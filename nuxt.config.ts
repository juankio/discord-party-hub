// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  colorMode: {
    preference: 'dark' // Forzar modo oscuro
  },
  ui: {
    global: true,
  },
  app: {
    head: {
      title: 'Discord Party Hub',
      meta: [
        { name: 'description', content: 'Tu hub de juegos en tiempo real' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      socketUrl: process.env.SOCKET_URL || 'http://localhost:3001'
    }
  }
})
