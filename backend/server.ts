import { Server } from "socket.io";

const PORT = 3001;

const io = new Server(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Estado en memoria
// roomCode -> { users: [...], hostUserId: string }
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("Nuevo usuario conectado:", socket.id);

  socket.on("join_room", (data) => {
    const { roomId, userId, nickname, avatarId, color } = data;
    
    socket.join(roomId);
    
    // Guardar datos en el socket
    socket.data = { userId, nickname, avatarId, color, roomId };

    if (!rooms.has(roomId)) {
      // El primero en crear/entrar a la sala es el host
      rooms.set(roomId, { users: [], hostUserId: userId });
    }

    const room = rooms.get(roomId);
    
    // Evitar nombres duplicados para usuarios DIFERENTES
    let finalNickname = nickname;
    let counter = 1;
    while (room.users.some((u: any) => u.nickname === finalNickname && u.userId !== userId)) {
      finalNickname = `${nickname} (copión ${counter})`;
      counter++;
    }

    // Comprobar si el usuario ya estaba en la sala (por F5 o reconexión)
    const existingIndex = room.users.findIndex((u: any) => u.userId === userId);
    
    if (existingIndex === -1) {
      room.users.push({ socketId: socket.id, userId, nickname: finalNickname, avatarId, color });
    } else {
      // Actualizar su socketId y estado en caso de reconexión
      room.users[existingIndex] = { socketId: socket.id, userId, nickname: finalNickname, avatarId, color };
    }

    // Emitir estado actualizado a toda la sala, incluyendo quién es el host
    io.to(roomId).emit("room_update", { 
      users: room.users,
      hostUserId: room.hostUserId
    });
    console.log(`${finalNickname} se unió a la sala ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
    const roomId = socket.data?.roomId;
    const userId = socket.data?.userId;
    
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      
      // En lugar de borrarlo de inmediato, podríamos dar un margen de gracia, 
      // pero por ahora lo quitamos visualmente de los online.
      room.users = room.users.filter((u: any) => u.userId !== userId);
      
      if (room.users.length === 0) {
        rooms.delete(roomId);
        console.log(`Sala ${roomId} eliminada por estar vacía.`);
      } else {
        // Si el host se fue, le pasamos el host al siguiente jugador en la lista
        if (room.hostUserId === userId) {
          room.hostUserId = room.users[0].userId;
        }
        io.to(roomId).emit("room_update", { 
          users: room.users,
          hostUserId: room.hostUserId
        });
      }
    }
  });
});

console.log(`🚀 Socket.io Server corriendo en http://localhost:${PORT}`);
