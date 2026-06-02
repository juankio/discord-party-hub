# 🧠 Backend - Discord Party Hub (Game Engines)

Este es el cerebro central del proyecto. Aquí se aloja el servidor de WebSockets (Socket.io) y todos los motores de reglas aislados para cada juego.

## 📂 Arquitectura

```text
/backend
├── package.json         # Dependencias (Socket.io)
├── src/
│   ├── server.ts        # Punto de entrada. Maneja las salas, reconexiones y el Host (El Lobby).
│   ├── core/            # (Próximamente) Clases utilitarias, RoomManager, GameDispatcher.
│   └── games/           # Los cerebros aislados de cada juego.
│       ├── uno/
│       ├── pinturillo/
│       ├── parchis/
│       ├── stop/
│       └── liars-bar/
```

## ⚙️ ¿Cómo funciona un Game Engine?

En este proyecto, un "Engine" (Motor) tiene una responsabilidad **Zero-Trust (Cero Confianza)**:
1. El cliente (Frontend) **nunca** calcula si una jugada es válida.
2. El cliente envía una "Intención" (Ej. `socket.emit("uno:play_card", { cardId: "red_5" })`).
3. El `[Juego]Engine` correspondiente en el servidor verifica si es el turno de ese jugador, si tiene esa carta y si la jugada es legal.
4. Si es válida, el Engine muta su estado interno y hace un `broadcast` a todos los jugadores con el nuevo estado del juego.

## 🚀 Ejecución (Modo Desarrollo)

El servidor está configurado para ejecutarse con **Bun**.

```bash
bun run dev
```

*Nota: No uses `npm install` ni `npm run`. Este proyecto es estrictamente entorno Bun.*