import { Server } from "socket.io";

const PORT = 3001;

const io = new Server(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Estado en memoria
// roomCode -> { users: [...] }
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("Nuevo usuario conectado:", socket.id);

  socket.on("join_room", (data) => {
    const { roomId, nickname, avatarId } = data;
    
    socket.join(roomId);
    
    // Guardar datos en el socket
    socket.data = { nickname, avatarId, roomId };

    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: [] });
    }

    const room = rooms.get(roomId);
    // Añadir usuario o actualizar si reconecta
    const existingIndex = room.users.findIndex((u: any) => u.id === socket.id);
    if (existingIndex === -1) {
      room.users.push({ id: socket.id, nickname, avatarId });
    }

    // Emitir estado actualizado a toda la sala
    io.to(roomId).emit("room_update", { users: room.users });
    console.log(`${nickname} se unió a la sala ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
    const roomId = socket.data?.roomId;
    
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.users = room.users.filter((u: any) => u.id !== socket.id);
      
      if (room.users.length === 0) {
        rooms.delete(roomId);
        console.log(`Sala ${roomId} eliminada por estar vacía.`);
      } else {
        io.to(roomId).emit("room_update", { users: room.users });
      }
    }
  });
});

console.log(`🚀 Socket.io Server corriendo en http://localhost:${PORT}`);
