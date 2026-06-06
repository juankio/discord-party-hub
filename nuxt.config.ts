// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
        { name: 'description', content: 'Tu hub de juegos en tiempo real. ¡Juega UNO y más con tus amigos!' },
        { property: 'og:title', content: 'Discord Party Hub' },
        { property: 'og:description', content: 'Tu hub de juegos en tiempo real. ¡Juega UNO y más con tus amigos!' },
        { property: 'og:image', content: 'https://discord-party-hub.vercel.app/banner.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Banner de Discord Party Hub' },
        { property: 'og:url', content: 'https://discord-party-hub.vercel.app/' },
        { property: 'og:site_name', content: 'Discord Party Hub' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Discord Party Hub' },
        { name: 'twitter:description', content: 'Tu hub de juegos en tiempo real. ¡Juega UNO y más con tus amigos!' },
        { name: 'twitter:image', content: 'https://discord-party-hub.vercel.app/banner.png' },
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
