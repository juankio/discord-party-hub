// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  features: {
    inlineStyles: false
  },
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxt/eslint'],
  css: ['~/assets/css/uno-cards.css'],
  colorMode: {
    preference: 'dark' // Forzar modo oscuro
  },
  ui: {
    global: true,
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  app: {
    head: {
      title: 'Discord Party Hub',
      meta: [
        { name: 'description', content: 'Tu hub de juegos en tiempo real. ¡Entra a jugar wachoo o te cagas!' },
        { name: 'theme-color', content: '#f97316' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  routeRules: {
    '/**': {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'unsafe-none'
      }
    }
  },
  runtimeConfig: {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    jwtSecret: process.env.JWT_SECRET,
    public: {
      socketUrl: process.env.SOCKET_URL || 'http://localhost:3001',
      googleClientId: process.env.GOOGLE_CLIENT_ID
    }
  }
})
