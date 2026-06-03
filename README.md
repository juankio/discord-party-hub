<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=f97316&height=200&section=header&text=Discord%20Party%20Hub&fontSize=50&fontColor=ffffff" alt="Discord Party Hub Banner" />
  
  <p><em>Un hub de minijuegos multijugador en tiempo real diseñado para jugarse por Discord con cero fricción.</em></p>

  <p>
    <img src="https://img.shields.io/badge/Nuxt-3.0-00DC82?style=flat-square&logo=nuxt.js" alt="Nuxt">
    <img src="https://img.shields.io/badge/Bun-Runtime-000000?style=flat-square&logo=bun" alt="Bun">
    <img src="https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socket.io" alt="Socket.io">
    <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb" alt="MongoDB">
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS">
  </p>
</div>

---

## 📸 Capturas de Pantalla (Preview)

> **Nota:** *Reemplazar estos placeholders con las capturas reales del proyecto (ej. usando la herramienta Recortes o Screenshots en `/docs`).*

<div align="center">
  <img src="https://placehold.co/600x350/1a0f0a/f97316?text=Lobby+Principal+\n(Mesa+y+Estanteria)" width="48%" />
  <img src="https://placehold.co/600x350/1a0f0a/f97316?text=Partida+de+UNO+\n(Fisicas+Anime.js)" width="48%" />
</div>

---

## 🚀 Inicio Rápido (Modo Desarrollo)

Este proyecto está dividido en dos partes que deben correr simultáneamente: el **Frontend** (Nuxt 3) y el **Backend** (Node.js/Socket.io). 

⚠️ **Regla estricta de la Tripulación:** Este proyecto usa `bun` exclusivamente. No uses `npm`.

### 1. Levantar el Backend (Motor de Juegos)
El servidor de WebSockets se encarga de la lógica Zero-Trust, el sistema de salas y la conexión a MongoDB.
```bash
cd backend
bun install
bun run dev
```
> El backend correrá en `http://localhost:3001`.

### 2. Levantar el Frontend (La Interfaz)
La interfaz de usuario interactiva y fluida.
```bash
# En la raíz del proyecto (discord-party-hub)
bun install
bun run dev
```
> El frontend correrá en `http://localhost:3000`.

---

## 🏛️ Arquitectura del Frontend (UI/UX)

La interfaz se rige por la estética **"Pro Max"** combinada con **"Flat 2D Vectorial"**.
- **Colores:** Fondos ultra oscuros (`#0A0A0A`, `#151515`) contrastados con acentos de neón dinámicos (inyectados vía `--theme-color`).
- **Profundidad sin 3D:** Se evita el desenfoque (blur) y el fotorrealismo. Los volúmenes se logran con bordes gruesos de madera, sombras sólidas (ej. `shadow-[8px_8px_0px_#000]`) y paletas de colores planos.
- **Componentes Destacados:**
  - `PlayerTable.vue`: Una mesa de billar plana vista desde arriba donde los jugadores se sientan. Identifica al creador de la mesa con una corona Flat 2D dorada.
  - `GameSelector.vue`: Un mueble de estantería de madera maciza. Los juegos descansan protegidos por una soga SVG.
  - `TableHistoryBar.vue`: Una pizarra rústica anclada al layout que muestra el *Leaderboard* en vivo (Top #1 en oro).

---

## ⚙️ Arquitectura del Backend (Node.js + Socket.io + MongoDB)

El backend no es solo un puente de mensajes, es el **Árbitro Supremo** (Zero-Trust).

### 1. Zero-Trust Engines (Motores de Juego Aislados)
El frontend es "tonto". Solo renderiza lo que el backend dicta.
- **`src/games/uno/UnoEngine.ts`**: Valida cada jugada (ej. si puedes tirar un +4 sobre un +2). Maneja reglas de la casa (`stackDrawCards`, `interceptExact`, `zeroAndSevenRules`). Si un cliente envía un evento de trampa, el Engine lo rechaza silenciosamente o devuelve un error.

### 2. Gestión de Salas (`RoomManager.ts`)
- Mantenedor del estado en memoria (`Map<string, RoomState>`).
- Maneja la reconexión de jugadores (F5 / Recarga de página) mediante un token de sesión.
- Implementa **Garbage Collection**: Las salas vacías o inactivas por más de 1 hora se auto-destruyen para liberar RAM.

### 3. Autenticación y Base de Datos (MongoDB)
- **`server/api/auth/google/callback.ts`**: Controlador oficial de Google OAuth. Recibe el `id_token`, lo verifica, extrae el perfil y crea/actualiza el documento en **MongoDB Atlas**.
- Devuelve un token JWT al frontend, el cual usa Pinia (`playerStore`) para iniciar sesión de forma persistente.
- **Estadísticas**: Colección dedicada en Mongo para trackear `totalWins`, `gamesPlayed` y preferencias visuales del usuario (Color y Avatar).

### 4. Eventos Socket Principales
| Evento (Emit) | Función |
| :--- | :--- |
| `join_room` | Conecta a un jugador a una sala o lo crea si no existe. |
| `start_game` | (Solo Host) Inicializa el `GameEngine` y reparte las cartas. |
| `play_card` | Intenta colocar una carta en la pila de descarte. Valida con el Engine. |
| `draw_card` | Pide robar una carta del mazo principal. |

| Evento (Listen) | Función |
| :--- | :--- |
| `room_state_update` | Sincroniza la lista de jugadores y el Host actual. |
| `game_state_update` | Envía la mano del jugador actual, la carta en la cima y de quién es el turno. |
| `error` | Captura y muestra rechazos del motor (ej. "No es tu turno"). |

---

## 📝 Reglas de Contribución (Luffy Crew)
1. **Atajos Prohibidos:** Nunca hacer commits directos a `main`. Usar ramas `feat/` o `fix/`.
2. **Refactorización Continua:** Componentes Vue limitados estrictamente a `< 150 líneas`. Si crecen, fragmentar.
3. **No `npm`:** Si haces `npm install`, te hacemos caminar por la tabla. Usa `bun`.
