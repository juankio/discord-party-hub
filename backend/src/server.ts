import { Server } from "socket.io";
import { startGameDispatcher, handleUnoEvents } from "./core/GameDispatcher.js";

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

    if (room.gameEngine && room.gameType === 'uno') {
      room.gameEngine.addPlayer(userId, socket.id, finalNickname, avatarId, color);
      io.to(socket.id).emit("game_started", { gameType: 'uno' });
      room.gameEngine.broadcastState();
    } else {
      io.to(socket.id).emit("return_to_lobby");
    }
  });

  startGameDispatcher(socket, io, rooms);
  handleUnoEvents(socket, io, rooms);

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
