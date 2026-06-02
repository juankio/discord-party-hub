# 🎮 Discord Party Hub

Un hub de minijuegos multijugador en tiempo real diseñado para jugarse por Discord con cero fricción. Creado con **Nuxt 3**, **Bun**, y **Socket.io**.

---

## 🚀 Inicio Rápido (Modo Desarrollo)

Este proyecto está dividido en dos partes que deben correr simultáneamente: el **Frontend** (Nuxt 3) y el **Backend** (Node.js/Socket.io). 
⚠️ **Regla estricta:** Este proyecto usa `bun` exclusivamente. No uses `npm`.

### 1. Levantar el Backend (Motor de Juegos)
El servidor de WebSockets se encarga de la lógica Zero-Trust y las salas.
```bash
cd backend
bun install
bun run dev
```
El backend correrá en `http://localhost:3001`.

### 2. Levantar el Frontend (La Interfaz)
La interfaz de usuario interactiva y fluida.
```bash
# En la raíz del proyecto (discord-party-hub)
bun install
bun run dev
```
El frontend correrá en `http://localhost:3000`.

---

## 🏛️ Arquitectura del Proyecto

Este no es un proyecto monolítico, es un **Hub Modular**.

### Frontend (`/`)
Construido con Vue 3 (Composition API) bajo el marco de Nuxt 3.
- **`components/core/`**: Componentes globales de la aplicación (La tarjeta de perfil de estilo oscuro, la mesa de billar vectorial 2D, etc.).
- **`components/games/`**: Componentes específicos de cada juego (Ej. `games/uno/Card.vue`).
- **`pages/sala/[id]/`**: Sistema de sub-rutas. El lobby principal está en `index.vue`, pero al lanzar un juego, se navega dinámicamente al motor visual del juego (ej. `uno.vue`, `pinturillo.vue`).
- **`stores/`**: Gestión de estado con Pinia. `playerStore` mantiene la persistencia del usuario (ID, color, avatar) guardándolo en `localStorage` para sobrevivir a las recargas (F5).

### Backend (`/backend`)
Servidor Express/Socket.io súper ligero.
- **Cero Confianza (Zero-Trust):** El frontend es "tonto". Nunca calcula reglas ni guarda estados secretos. Todo se procesa en el backend.
- **Motores Aislados (`src/games/`)**: Cada juego tiene su propio motor de reglas puro (Ej. `UnoEngine.ts`, `ParchisEngine.ts`) para evitar mezclar la lógica de pintar en un lienzo con la lógica de tirar un dado.

---

## 🎨 Diseño Visual (UI/UX)
- **Estética "Pro Max"**: Fondos ultra oscuros (`#0A0A0A`), tarjetas en `#151515`, sin esquinas cuadradas (todo `rounded-3xl` o circular).
- **Acentos**: Colores neón sutiles, principalmente naranja (`#f97316`) y glows de colores elegidos por el usuario.
- **Animaciones**: Transiciones fluidas nativas de Vue (`<Transition>`) y coreografías complejas impulsadas por `anime.js`.

---

## 🛠️ Stack Tecnológico
- **Runtime & PM**: [Bun](https://bun.sh/)
- **Framework Frontend**: [Nuxt 3](https://nuxt.com/)
- **UI & Estilos**: [Nuxt UI v3](https://ui.nuxt.com/) / Tailwind CSS
- **Estado**: [Pinia](https://pinia.vuejs.org/)
- **Animaciones**: [Anime.js](https://animejs.com/)
- **WebSockets**: [Socket.io](https://socket.io/) (v4)
