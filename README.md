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

## 📸 Capturas de Pantalla

<div align="center">
  <img src="./docs/assets/lobby.png" width="48%" alt="Lobby y Mesa de Billar" />
  <img src="./docs/assets/uno-game.png" width="48%" alt="Partida de UNO" />
</div>

---

## 🚀 Inicio Rápido (Modo Desarrollo)

Este proyecto está dividido en dos partes que deben correr simultáneamente: el **Frontend** (Nuxt 3) y el **Backend** (Node.js/Socket.io). 

⚠️ **Regla estricta de la Tripulación:** Este proyecto usa `bun` exclusivamente. No uses `npm`.

### 1. Levantar el Backend (Motor de Juegos)
El servidor de WebSockets ahora se encuentra en su propio repositorio para mantener la arquitectura limpia.

> **Importante**: Asegúrate de haber clonado y configurado el backend por separado.

```bash
# Asumiendo que clonaste el backend en otra carpeta
cd ../discord-party-hub-backend
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
- **Cliente 100% Puro:** El frontend de Nuxt no contiene base de datos, SSR APIs pesadas ni lógica de servidor interno. Toda la comunicación de red apunta exclusivamente al servidor Node.js/Express.
- **Colores:** Fondos ultra oscuros (`#0A0A0A`, `#151515`) contrastados con acentos de neón dinámicos (inyectados vía `--theme-color`).
- **Profundidad sin 3D:** Se evita el desenfoque (blur) y el fotorrealismo. Los volúmenes se logran con bordes gruesos de madera, sombras sólidas (ej. `shadow-[8px_8px_0px_#000]`) y paletas de colores planos.
- **Componentes Destacados:**
  - `PlayerTable.vue`: Una mesa de casino (`bg-[#991b1b]`) plana vista desde arriba. Identifica al creador de la mesa con una corona Flat 2D dorada.
  - `GameSelector.vue`: Un mueble de estantería de madera maciza. Los juegos descansan protegidos por una soga SVG.
  - `TableHistoryBar.vue`: Una pizarra rústica anclada al layout que muestra el *Leaderboard* en vivo.

---

## ⚙️ Arquitectura de Sincronización
- Nuxt UI consume el estado mediante `Pinia` (`playerStore.ts`, `unoStore.ts`).
- Las peticiones HTTP (Leaderboard, Update Profile) utilizan `$fetch` consumiendo el puerto de la API externa (Express).
- La conexión de WebSockets se gestiona en `composables/useSocket.ts` implementando un control bidireccional "Anti-Ping-Pong" para no sobrecargar el servidor en eventos reactivos (ej. Apagar switches).

---

## 📝 Reglas de Contribución (Luffy Crew)
1. **Atajos Prohibidos:** Nunca hacer commits directos a `main`. Usar ramas `feat/` o `fix/`.
2. **Refactorización Continua:** Componentes Vue limitados estrictamente a `< 150 líneas`. Si crecen, fragmentar.
3. **No `npm`:** Si haces `npm install`, te hacemos caminar por la tabla. Usa `bun`.
