# 🎮 Discord Party Hub (Frontend)

![Nuxt 3](https://img.shields.io/badge/Nuxt_3-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Anime.js](https://img.shields.io/badge/Anime.js-181818?style=for-the-badge&logo=javascript&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

Tu hub de juegos multijugador en tiempo real con una interfaz **Pro Max**. Juega UNO con tus amigos, personaliza las reglas de la sala y disfruta de una experiencia fluida y reactiva.

## ✨ Características Principales

*   **UI/UX Premium:** Diseño moderno "Glassmorphism" y "Dark Neon", 100% responsivo (Mobile-first, optimizado para 390px).
*   **Animaciones Fluidas:** Interacciones, reparto de cartas en cascada, robos de turno (Corte Exacto) orquestados con `anime.js`.
*   **UNO Extendido:** Soporte para múltiples reglas personalizadas (Acumulación de +2/+4, Robar hasta que salga, Intercepción Exacta, Regla del 0 y 7).
*   **Optimización SEO y WhatsApp:** Vistas previas de enlaces generadas dinámicamente con OpenGraph y Twitter Cards para invitar amigos con estilo.
*   **Arquitectura Limpia:** Construido siguiendo estrictamente patrones de *Clean Code*, componentes atómicos (`<UnoCard />`) y composables modulares.

## 🛠️ Tecnologías

*   **Framework:** Nuxt 3 / Vue 3 (Composition API)
*   **Estilos:** Tailwind CSS + Nuxt UI
*   **Estado:** Pinia
*   **Animaciones:** Anime.js
*   **Tiempo Real:** Socket.io-client
*   **Linter/Type Checking:** TypeScript estricto

## 🚀 Instalación y Uso

**Importante:** Este proyecto utiliza **Bun** como gestor de paquetes exclusivo. Prohibido usar `npm`.

```bash
# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## 📂 Estructura de Directorios

*   `/components`: Componentes atómicos y de UI.
    *   `/games/uno`: Componentes específicos del juego (cartas, mesa, mano).
*   `/composables`: Hooks reactivos y lógica visual.
    *   `/uno`: Lógica fragmentada de animaciones (`useUnoDrawFx`, `useUnoActionFx`, etc.).
*   `/pages`: Sistema de rutas automáticas de Nuxt (`/sala/[id]`).
*   `/stores`: Estados globales gestionados por Pinia.
*   `/utils`: Utilidades puras (e.g., manejo de LocalStorage para perfiles).

---
*Hecho por la tripulación del Sombrero de Paja 🏴‍☠️*
