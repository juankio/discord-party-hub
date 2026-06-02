import { Server } from "socket.io";
import { UnoEngine, UnoRules } from "./games/uno/UnoEngine.js";

const PORT = 3001;

const io = new Server(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Estado en memoria
// roomCode -> { users: [...], hostUserId: string, gameEngine?: UnoEngine, gameType?: string }
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("Nuevo usuario conectado:", socket.id);

  socket.on("join_room", (data) => {
    const { roomId, userId, nickname, avatarId, color } = data;
    
    socket.join(roomId);
    socket.data = { userId, nickname, avatarId, color, roomId };

    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: [], hostUserId: userId });
    }

    const room = rooms.get(roomId);
    
    let finalNickname = nickname;
    let counter = 1;
    while (room.users.some((u: any) => u.nickname === finalNickname && u.userId !== userId)) {
      finalNickname = `${nickname} (copión ${counter})`;
      counter++;
    }

    const existingIndex = room.users.findIndex((u: any) => u.userId === userId);
    
    if (existingIndex === -1) {
      room.users.push({ socketId: socket.id, userId, nickname: finalNickname, avatarId, color });
    } else {
      room.users[existingIndex] = { socketId: socket.id, userId, nickname: finalNickname, avatarId, color };
    }

    const hostStillExists = room.users.some((u: any) => u.userId === room.hostUserId);
    if (!hostStillExists && room.users.length > 0) {
      room.hostUserId = room.users[0].userId;
    }

    io.to(roomId).emit("room_update", { 
      users: room.users,
      hostUserId: room.hostUserId
    });

    // Si ya hay un juego corriendo, meterlo y enviarle estado
    if (room.gameEngine && room.gameType === 'uno') {
      room.gameEngine.addPlayer(userId, socket.id, finalNickname, avatarId, color);
      room.gameEngine.broadcastState();
    }
  });

  // ---- EVENTOS DE JUEGO (GAME DISPATCHER TEMPORAL) ----
  socket.on("start_game", (data) => { console.log("START GAME RECEIVED", data);
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    const room = rooms.get(roomId);
    
    if (!room || room.hostUserId !== userId) return; // Solo el host

    const gameType = data.gameType || 'uno';
    if (gameType === 'uno') {
      const rules: UnoRules = data.rules || {
        stackDrawCards: false, drawUntilPlayable: false, 
        playMultipleSame: false, interceptExact: false, zeroAndSevenRules: false
      };

      room.gameType = 'uno';
      room.gameEngine = new UnoEngine(roomId, (event: string, payload?: any) => {
        if (event === 'game_state_update') {
          // Enviar estado privado al socket correcto
          const targetSocketId = room.users.find((u:any) => u.userId === payload.targetUserId)?.socketId;
          if (targetSocketId) io.to(targetSocketId).emit(event, payload.state);
        } else {
          // Mensajes globales
          io.to(roomId).emit(event, payload);
        }
      });

      // Llenar el motor con los jugadores de la sala
      room.users.forEach((u: any) => {
        room.gameEngine.addPlayer(u.userId, u.socketId, u.nickname, u.avatarId, u.color);
      });

      // Empezar
      io.to(roomId).emit("game_started", { gameType: 'uno' });
      room.gameEngine.startGame(rules);
    }
  });

  socket.on("uno:play_cards", (cardIds: string[]) => {
    const room = rooms.get(socket.data.roomId);
    if (room?.gameEngine) room.gameEngine.playCards(socket.data.userId, cardIds);
  });

  socket.on("uno:draw_card", () => {
    const room = rooms.get(socket.data.roomId);
    if (room?.gameEngine) room.gameEngine.drawFromDeck(socket.data.userId);
  });

  socket.on("uno:declare_color", (color: string) => {
    const room = rooms.get(socket.data.roomId);
    if (room?.gameEngine) room.gameEngine.declareColor(socket.data.userId, color as any);
  });

  socket.on("uno:yell_uno", () => {
    const room = rooms.get(socket.data.roomId);
    if (room?.gameEngine) room.gameEngine.yellUno(socket.data.userId);
  });

  socket.on("uno:challenge_uno", (targetId: string) => {
    const room = rooms.get(socket.data.roomId);
    if (room?.gameEngine) room.gameEngine.challengeUno(socket.data.userId, targetId);
  });

  // -----------------------------------------------------

  socket.on("disconnect", () => {
    const roomId = socket.data?.roomId;
    const userId = socket.data?.userId;
    
    if (roomId && rooms.has(roomId)) {
      setTimeout(() => {
        const room = rooms.get(roomId);
        if (!room) return;

        const currentUser = room.users.find((u: any) => u.userId === userId);
        
        if (currentUser && currentUser.socketId === socket.id) {
          room.users = room.users.filter((u: any) => u.userId !== userId);
          
          // Informar al motor si hay juego
          if (room.gameEngine) room.gameEngine.removePlayer(userId);

          if (room.users.length === 0) {
            rooms.delete(roomId);
          } else {
            if (room.hostUserId === userId) {
              room.hostUserId = room.users[0].userId;
            }
            io.to(roomId).emit("room_update", { 
              users: room.users,
              hostUserId: room.hostUserId
            });
          }
        }
      }, 3000);
    }
  });
});

console.log(`🚀 Socket.io Server corriendo en http://localhost:${PORT}`);
